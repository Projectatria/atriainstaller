import { Component } from '@angular/core';
import { App, AlertController, IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Http, Headers, RequestOptions } from '@angular/http';
import { BackgroundMode } from '@ionic-native/background-mode';
import { Insomnia } from '@ionic-native/insomnia';
import moment from 'moment';
import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  GoogleMapOptions,
  CameraPosition,
  MarkerOptions,
  Marker,
  LocationService,
  MyLocationOptions,
  MyLocation,
  GoogleMapsAnimation,
  Polyline,
  LatLng,
  Geocoder,
  GeocoderResult
} from '@ionic-native/google-maps';
import { Md5 } from 'ts-md5/dist/md5';

declare var google: any;

@IonicPage()
@Component({
  selector: 'page-detailpengiriman',
  templateUrl: 'detailpengiriman.html',
})
export class DetailpengirimanPage {

  public loading: any;
  public detailpengiriman = [];
  public noregistrasitruk: any;
  public detailsales = [];
  public datatr = [];
  public no: any;
  public name: any;
  public address: any;
  public telp: any;
  public latitude: any;
  public longitude: any;
  public jaraktempuh: any;
  public waktuperjalanan: any;
  public pushdata = [];
  public pushjarak = [];
  public datakirim = [];
  public notruk: any;
  public userid: any;
  map: GoogleMap;
  public interval: any;
  directionsService = new google.maps.DirectionsService;
  directionsDisplay = new google.maps.DirectionsRenderer;
  public checkshow: boolean = false;
  public itemsall = [];
  public datapart = [];
  public listpart = [];
  public kirim = [];
  public kirimall = [];
  public inputqty = 0;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public app: App,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public api: ApiProvider,
    public backgroundMode: BackgroundMode,
    private insomnia: Insomnia) {
    this.checkshow = false;
    this.inputqty = 0;
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    this.loading.present().then(() => {
      this.backgroundMode.enable();
      this.backgroundMode.on("activate").subscribe(() => {
        this.notruk = this.navParams.get('notruk')
        this.userid = this.navParams.get('userid')
        this.datakirim = this.navParams.get('data')
        if (navigator.geolocation) {
          this.interval = navigator.geolocation.watchPosition((position) => {
            let idtruck = this.notruk
            let iddriver = this.userid
            let lat = position.coords.latitude
            let lon = position.coords.longitude
            if (idtruck && iddriver) {
              this.api.get("table/latlon", { params: { limit: 1, filter: "id_truck='" + idtruck + "' AND status = 'OPEN'", sort: "datetime" + " DESC " } })
                .subscribe(val => {
                  let data = val['data']
                  if (data.length > 0) {
                    if (data[0].latitude.substring(0, 8) == lat.toString().substring(0, 8) && data[0].longitude.substring(0, 9) == lon.toString().substring(0, 9)) {
                    }
                    else {
                      this.doInsert(lat, lon, idtruck, iddriver)
                    }
                  }
                  else {
                    this.doInsert(lat, lon, idtruck, iddriver)
                  }
                });
            }
          });
        } else {
          alert("Geolocation is not supported by this browser.")
        }
      });
      this.notruk = this.navParams.get('notruk')
      this.userid = this.navParams.get('userid')
      this.datakirim = this.navParams.get('data')
      if (navigator.geolocation) {
        this.interval = navigator.geolocation.watchPosition((position) => {
          let idtruck = this.notruk
          let iddriver = this.userid
          let lat = position.coords.latitude
          let lon = position.coords.longitude
          if (idtruck && iddriver) {
            this.api.get("table/latlon", { params: { limit: 1, filter: "id_truck='" + idtruck + "' AND status = 'OPEN'", sort: "datetime" + " DESC " } })
              .subscribe(val => {
                let data = val['data']
                if (data.length > 0) {
                  if (data[0].latitude.substring(0, 8) == lat.toString().substring(0, 8) && data[0].longitude.substring(0, 9) == lon.toString().substring(0, 9)) {
                  }
                  else {
                    this.doInsert(lat, lon, idtruck, iddriver)
                  }
                }
                else {
                  this.doInsert(lat, lon, idtruck, iddriver)
                }
              });
          }
        });
      } else {
        alert("Geolocation is not supported by this browser.")
      }
    });
  }
  ionViewDidEnter() {
    this.notruk = this.navParams.get('notruk')
    this.userid = this.navParams.get('userid')
    this.datakirim = [];
    this.doGetKirimNew()
  }
  doInsert(lat, lon, idtruck, iddriver) {
    this.api.get('nextno/latlon/id')
      .subscribe(val => {
        let nextno = val['nextno'];
        const headers = new HttpHeaders()
          .set("Content-Type", "application/json");
        this.api.post("table/latlon",
          {
            "id": nextno,
            "id_truck": idtruck,
            "id_user": iddriver,
            "latitude": lat,
            "longitude": lon,
            "datetime": moment().format('YYYY-MM-DD HH:mm:ss'),
            "devices": 'MOBILE',
            "status": 'OPEN'
          },
          { headers })
          .subscribe(
            (val) => {
            });
      }, err => {
        console.log('')
      });
  }
  ngAfterViewInit() {
    this.loading.dismiss()
  }
  readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function () {
      if (rawFile.readyState === 4) {
        callback(rawFile.responseText);
      }
    }
    rawFile.send(null);
  }
  doMaps(kirim) {
    navigator.geolocation.clearWatch(this.interval);
    if (kirim.status == 'OPEN' || kirim.status == 'PENDING') {
      this.navCtrl.push('MapsPage', {
        userid: this.userid,
        notruk: this.notruk,
        kirim: kirim,
        datakirim: this.datakirim
      });
    }
    else {
      this.app.getRootNav().setRoot('MapsPage', {
        userid: this.userid,
        notruk: this.notruk,
        kirim: kirim,
        datakirim: this.datakirim
      });
    }
  }
  doSettings() {
    let alert = this.alertCtrl.create({
      title: 'Change your password',
      inputs: [
        {
          name: 'passwordsebelumnya',
          placeholder: 'Password sebelumnya'
        },
        {
          name: 'passwordbaru',
          placeholder: 'Password baru'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'OK',
          handler: data => {
            this.api.get('table/user', { params: { filter: "id_user=" + "'" + this.userid + "'" } })
              .subscribe(val => {
                let datauser = val['data']
                let password = Md5.hashStr(data.passwordsebelumnya)
                if (password == datauser[0].password) {
                  let passwordbaru = Md5.hashStr(data.passwordbaru)
                  const headers = new HttpHeaders()
                    .set("Content-Type", "application/json");
                  this.api.put("table/user",
                    {
                      "id_user": this.userid,
                      "password": passwordbaru
                    },
                    { headers })
                    .subscribe(
                      (val) => {
                        let alert = this.alertCtrl.create({
                          subTitle: 'Sukses',
                          buttons: ['OK']
                        });
                        alert.present();
                      });
                }
                else {
                  let alert = this.alertCtrl.create({
                    subTitle: 'Password salah',
                    buttons: ['OK']
                  });
                  alert.present();
                }
              })
          }
        }
      ]
    });
    alert.present();
  }
  doLogout() {
    let alert = this.alertCtrl.create({
      title: 'Confirm Logout',
      message: 'Do you want to logout?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Logout',
          handler: () => {
            navigator.geolocation.clearWatch(this.interval);
            this.app.getRootNav().setRoot('LoginPage', {
              truck: this.notruk
            })
          }
        }
      ]
    });
    alert.present();
  }
  doGetKirimNew() {
    this.api.get("table/slot_installation", { params: { limit: 100, filter: "group_delivery_no='" + this.navParams.get('data')[0].group_delivery_no + "' AND date_installation=" + "'" + moment().format('YYYY-MM-DD') + "'", sort: 'no_urut_group ASC' } })
      .subscribe(val => {
        this.datakirim = val['data']
      });
  }

}
