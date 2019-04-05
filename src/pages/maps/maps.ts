import { Component, ElementRef, ViewChild } from '@angular/core';
import { App, ToastController, IonicPage, NavController, LoadingController, NavParams, AlertController } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Http, Headers, RequestOptions } from '@angular/http';
import { BackgroundMode } from '@ionic-native/background-mode';
import { Insomnia } from '@ionic-native/insomnia';
import moment from 'moment';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { UUID } from 'angular2-uuid';
import { ImageViewerController } from 'ionic-img-viewer';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
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

declare var google;
declare var Email;

@IonicPage()
@Component({
  selector: 'page-maps',
  templateUrl: 'maps.html'
})

export class MapsPage {

  public loading: any;
  public nobooking: any;
  public detailsales = [];
  public name: any;
  public address: any;
  public telp: any;
  public latitude: any;
  public longitude: any;
  public jaraktempuh: any;
  public waktuperjalanan: any;
  public interval: any;
  public token: any;
  public status: any;
  public book: any;
  public detailbook: any;
  public intervalcust: any;
  public userid: any;
  public notruk: any;
  public start = false;
  public idtruk: any;
  public kirim = [];
  public itemsall = [];
  public checkshow: boolean = false;
  public camerashow: boolean = false;
  public datakirim = [];
  imageURI: string = '';
  imageFileName: string = '';
  public uuid = '';
  public photos = [];
  public locationupdate: any;
  map: GoogleMap;
  directionsService = new google.maps.DirectionsService;
  directionsDisplay = new google.maps.DirectionsRenderer;
  public watch: any;
  public unlocked: boolean = true;

  constructor(
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public navParam: NavParams,
    public toastCtrl: ToastController,
    public app: App,
    public alertCtrl: AlertController,
    public api: ApiProvider,
    public backgroundMode: BackgroundMode,
    private transfer: FileTransfer,
    private camera: Camera,
    private insomnia: Insomnia) {
    this.checkshow = false;
    this.camerashow = false;
    this.backgroundMode.enable();
    this.backgroundMode.on("activate").subscribe(() => {
      this.api.get("table/slot_installation", { params: { limit: 100, filter: "date_installation=" + "'" + moment().format('YYYY-MM-DD') + "' AND uuid=" + "'" + this.navParam.get('kirim')['uuid'] + "'", sort: 'no_urut_group ASC' } })
        .subscribe(val => {
          this.kirim = val['data'][0]
          this.userid = this.navParam.get('userid')
          this.notruk = this.navParam.get('notruk')
          this.datakirim = this.navParam.get('datakirim')
          if (this.kirim['status'] == 'OPEN' || this.kirim['status'] == 'PENDING') {
            this.status = '0'
            this.unlocked = true;
            this.doUpdateLatLon()
          }
          else if (this.kirim['status'] == 'SHIPMENT') {
            this.status = '1'
            this.unlocked = false;
            this.doUpdateLatLonGoToCust()
          }
          else if (this.kirim['status'] == 'ARRIVED') {
            this.status = '2'
            this.unlocked = false;
            this.doUpdateLatLonGoToCust()
          }
          else if (this.kirim['status'] == 'DONE') {
            this.status = '3'
            this.unlocked = false;
            this.doUpdateLatLonGoToCust()
          }
        });
    });
    this.doGetToken()
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    this.loading.present().then(() => {
      this.api.get("table/slot_installation", { params: { limit: 100, filter: "date_installation=" + "'" + moment().format('YYYY-MM-DD') + "' AND uuid=" + "'" + this.navParam.get('kirim')['uuid'] + "'", sort: 'no_urut_group ASC' } })
        .subscribe(val => {
          this.kirim = val['data'][0]
          this.userid = this.navParam.get('userid')
          this.notruk = this.navParam.get('notruk')
          this.datakirim = this.navParam.get('datakirim')
          if (this.kirim['status'] == 'OPEN' || this.kirim['status'] == 'PENDING') {
            this.status = '0'
            this.unlocked = true;
            this.doUpdateLatLon()
          }
          else if (this.kirim['status'] == 'SHIPMENT') {
            this.status = '1'
            this.unlocked = false;
            this.doUpdateLatLonGoToCust()
          }
          else if (this.kirim['status'] == 'ARRIVED') {
            this.status = '2'
            this.unlocked = false;
            this.doUpdateLatLonGoToCust()
          }
          else if (this.kirim['status'] == 'DONE') {
            this.status = '3'
            this.unlocked = false;
            this.doUpdateLatLonGoToCust()
          }
          this.initMapGoogleNative()
        });
    })
  }
  ionViewDidLoad() {
  }
  ionViewWillLeave() {
    navigator.geolocation.clearWatch(this.locationupdate);
  }
  initMapGoogleNative() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        var self = this;
        this.directionsService.route({
          origin: { lat: position.coords.latitude, lng: position.coords.longitude },
          destination: { lat: parseFloat(this.kirim['to_lat']), lng: parseFloat(this.kirim['to_lng']) },
          travelMode: 'DRIVING'
        }, (response, status) => {
          if (status === 'OK') {
            var line = [];
            this.jaraktempuh = response.routes[0].legs[0].distance.text
            this.waktuperjalanan = response.routes[0].legs[0].duration.text
          } else {

          }
        });
        let mapOptions: GoogleMapOptions = {
          camera: {
            target: {
              lat: parseFloat(this.kirim['to_lat']),
              lng: parseFloat(this.kirim['to_lng'])
            },
            zoom: 12,
            tilt: 0
          }
        };

        this.map = GoogleMaps.create('map_canvas', mapOptions);

        let options: MarkerOptions = {
          icon: {
            url: 'http://101.255.60.202/webapi5/img/car',

            size: {
              width: 40,
              height: 32
            }
          },

          /*title: 'Hello World',
        
          snippet: '@ionic-native/google-maps',*/

          position: { lat: position.coords.latitude, lng: position.coords.longitude },

          /*infoWindowAnchor: [16, 0],
        
          anchor: [16, 32],
        
          draggable: true,
        
          flat: false,*/

          rotation: 0,

          visible: true,

          styles: {
            'text-align': 'center',
            'font-style': 'italic',
            'font-weight': 'bold',
            'color': 'red'
          },

          animation: GoogleMapsAnimation.DROP,

          zIndex: 0,

          disableAutoPan: true
        };
        this.doUpdateLocation()
        this.map.addMarker(options).then((marker: Marker) => {

          marker.showInfoWindow();

        });

        let markerdestination: Marker = this.map.addMarkerSync({
          title: this.name,
          icon: 'red',
          animation: 'DROP',
          position: {
            lat: this.kirim['to_lat'],
            lng: this.kirim['to_lng']
          }
        });
        markerdestination.showInfoWindow();
        markerdestination.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
          markerdestination.showInfoWindow()
        });
      });
    } else {
      alert("Geolocation is not supported by this browser.")
    }
  }
  doUpdateLocation() {
    if (navigator.geolocation) {
      this.locationupdate = navigator.geolocation.watchPosition((position) => {
        this.directionsService.route({
          origin: { lat: position.coords.latitude, lng: position.coords.longitude },
          destination: { lat: parseFloat(this.kirim['to_lat']), lng: parseFloat(this.kirim['to_lng']) },
          travelMode: 'DRIVING'
        }, (response, status) => {
          if (status === 'OK') {
            var line = [];
            this.jaraktempuh = response.routes[0].legs[0].distance.text
            this.waktuperjalanan = response.routes[0].legs[0].duration.text
          } else {

          }
        });
      });
    } else {
      alert("Geolocation is not supported by this browser.")
    }
  }
  ngAfterViewInit() {
    this.loading.dismiss()
  }
  doMaps() {
    let url = 'https://www.google.com/maps/dir/?api=1&destination=' + this.kirim['to_lat'] + "," + this.kirim['to_lng']
    window.location.href = url
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
  doInsert(lat, lon) {
    this.api.get('nextno/latlon/id')
      .subscribe(val => {
        let nextno = val['nextno'];
        const headers = new HttpHeaders()
          .set("Content-Type", "application/json");
        this.api.post("table/latlon",
          {
            "id": nextno,
            "booking_no": '',
            "id_truck": this.notruk,
            "id_user": this.userid,
            "latitude": lat,
            "longitude": lon,
            "devices": 'MOBILE',
            "datetime": moment().format('YYYY-MM-DD HH:mm:ss'),
            "status": 'OPEN'
          },
          { headers })
          .subscribe(
            (val) => {
            });
      }, err => {
        this.doInsert(lat, lon)
      });
  }
  doInsertGoToCust(lat, lon) {
    this.api.get('nextno/latlon/id')
      .subscribe(val => {
        let nextno = val['nextno'];
        const headers = new HttpHeaders()
          .set("Content-Type", "application/json");
        this.api.post("table/latlon",
          {
            "id": nextno,
            "booking_no": this.kirim['receipt_no'],
            "id_truck": this.notruk,
            "id_user": this.userid,
            "latitude": lat,
            "longitude": lon,
            "devices": 'MOBILE',
            "datetime": moment().format('YYYY-MM-DD HH:mm:ss'),
            "status": 'OPEN'
          },
          { headers })
          .subscribe(
            (val) => {
            });
      }, err => {
        this.doInsertGoToCust(lat, lon)
      });
  }
  doGetToken() {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    this.api.gettokensms("api/login",
      {
        "userid": 'sa',
        "password": 'masterpass@w0rd10'
      },
      { headers })
      .subscribe(
        (val) => {
          this.token = val['access_token']
        }, err => {
          this.doGetToken()
        });
  }
  ionViewCanLeave() {
    return this.unlocked
  }
  doSendSMS() {
    this.start = true;
    this.unlocked = false;
    navigator.geolocation.clearWatch(this.interval);
    if (navigator.geolocation) {
      this.intervalcust = navigator.geolocation.watchPosition((position) => {
        let lat = position.coords.latitude
        let lon = position.coords.longitude
        let idtruck = this.notruk
        if (idtruck) {
          this.api.get("table/latlon", { params: { limit: 1, filter: "id_truck='" + idtruck + "' AND status = 'OPEN'", sort: "datetime" + " DESC " } })
            .subscribe(val => {
              let data = val['data']
              if (data.length > 0) {
                if (data[0].latitude.substring(0, 8) == lat.toString().substring(0, 8) && data[0].longitude.substring(0, 9) == lon.toString().substring(0, 9)) {
                }
                else {
                  this.doInsertGoToCust(lat, lon)
                }
              }
              else {
                this.doInsertGoToCust(lat, lon)
              }
            });
        }
      });
    } else {
      alert("Geolocation is not supported by this browser.")
    }
    var self = this;
    /*console.log(this.token)
    const headers = new HttpHeaders()
      .set("Authorization", "Bearer " + this.token);
    this.api.postsendsms("api/SMS/SendSMS",
      {
        "no": '08159596494',
        "pesan": 'test',
        "ultah": '0'
      },
      { headers })
      .subscribe(
        (val) => {
          console.log(val)
        });*/
    this.status = '1'
    this.doUpdateSlotDeliveryShipment()
    let toast = self.toastCtrl.create({
      message: 'Pekerjaan dimulai',
      duration: 3000,
      position: 'bottom'
    });
    toast.present();
    var datetime = moment().format('DD MMMM YYYY HH:mm')
    var templateemail = [
      '<tr><td><table cellspacing="0" cellpadding="0" border="0" align="center" style="border-collapse:collapse;background-color:#ffffff;max-width:600px;border:1px solid #e0e0e0"><tr><td style="padding:10px 10px 10px;" bgcolor="#000000"><table cellspacing="0" cellpadding="0" width="100%" style="border-collapse:collapse;color:#ffffff"><tr><td width="280"><a href="http://atria.co.id"><img src="http://diskonbuzz.com/admin/images/merchantlogo/4365.jpg" title="Atria Inspiring Living" alt="Atria Inspiring Living" style="height:60px"/></a></td><td width="280" align="right" style="font-size:16px;line-height:1.5"></td></tr></table></td></tr><tr><td style="font-size:16px;padding:16px 12px 0;font-weight:bold;color:rgba(0,0,0,0.72);line-height:24px">Halo ' + this.kirim['to_name'] + ',</td></tr><tr><td style="padding:2px 12px"><table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;font-size:13px"><tr><td style="line-height:1.67;color:rgba(0,0,0,0.72);font-size:13px">Truk pengiriman paket anda sedang dalam perjalanan, untuk info klik link dibawah ini : </td></tr></table></td></tr><tr><td style="padding:10px 12px"><table cellpadding="0" cellspacing="0" style="border:1px solid #e0e0e0;width:100%;text-align:center;padding:10px;border-bottom-width:0;border-radius:3px 3px 0px 0px"><tr><td><div><a href="http://atria.co.id" style="margin-top:2px;color:#42b549;font-size:14px;line-height:24px;line-height:1.85;font-weight:600;text-decoration:none" target="_blank">http://atria.co.id</a></div></td></tr></table><table cellpadding="0" cellspacing="0" style="border:1px solid #e0e0e0;width:100%;padding:12px 12px 20px 12px;border-bottom-width:1px"><tr><td align="left"><div><div style="margin-top:5px;font-size:10px;line-height:12px;color:#000;opacity:0.38">' + datetime + ' ' + 'WIB</div></div></td></tr><tr><td></td></tr></table></td></tr>'
    ]
    Email.send("omegamediastreaming@gmail.com",
      "ajidwip6@gmail.com",
      "Paket anda sedang dalam perjalanan",
      templateemail,
      "smtp.gmail.com",
      "omegamediastreaming@gmail.com",
      "Utadahikaru227",
      function done(message) {
      });
  }
  doUpdateLatLon() {
    if (navigator.geolocation) {
      this.interval = navigator.geolocation.watchPosition((position) => {
        let lat = position.coords.latitude
        let lon = position.coords.longitude
        let idtruck = this.notruk
        if (idtruck) {
          this.api.get("table/latlon", { params: { limit: 1, filter: "id_truck='" + idtruck + "' AND status = 'OPEN'", sort: "datetime" + " DESC " } })
            .subscribe(val => {
              let data = val['data']
              if (data.length > 0) {
                if (data[0].latitude.substring(0, 8) == lat.toString().substring(0, 8) && data[0].longitude.substring(0, 9) == lon.toString().substring(0, 9)) {
                }
                else {
                  this.doInsert(lat, lon)
                }
              }
              else {
                this.doInsert(lat, lon)
              }
            });
        }
      });
    } else {
      alert("Geolocation is not supported by this browser.")
    }
  }
  doUpdateLatLonGoToCust() {
    if (navigator.geolocation) {
      this.intervalcust = navigator.geolocation.watchPosition((position) => {
        let lat = position.coords.latitude
        let lon = position.coords.longitude
        let idtruck = this.notruk
        if (idtruck) {
          this.api.get("table/latlon", { params: { limit: 1, filter: "id_truck='" + idtruck + "' AND status = 'OPEN'", sort: "datetime" + " DESC " } })
            .subscribe(val => {
              let data = val['data']
              if (data.length > 0) {
                if (data[0].latitude.substring(0, 8) == lat.toString().substring(0, 8) && data[0].longitude.substring(0, 9) == lon.toString().substring(0, 9)) {
                }
                else {
                  this.doInsertGoToCust(lat, lon)
                }
              }
              else {
                this.doInsertGoToCust(lat, lon)
              }
            });
        }
      });
    } else {
      alert("Geolocation is not supported by this browser.")
    }
  }
  doSampaiTujuan() {
    this.status = '2'
    this.doUpdateSlotDeliveryArrived()
  }
  doGetCamera() {
    this.doOpenCamera()
  }
  doSelesai() {
    navigator.geolocation.clearWatch(this.intervalcust);
    this.doUpdateSlotDeliveryCLSD()
  }
  doCheckBarang() {
    this.api.get("table/delivery_order_line", { params: { limit: 100, filter: "receipt_no='" + this.kirim['receipt_no'] + "'", sort: "part_no" + " ASC " } })
      .subscribe(val => {
        this.itemsall = val['data']
        this.checkshow = true;
      }, err => {
        this.doCheckBarang()
      });
  }
  doOffAdd() {
    this.itemsall = [];
    this.checkshow = false;
  }
  doReport() {
    let alert = this.alertCtrl.create({
      title: 'Pending Pengiriman',
      inputs: [
        {
          name: 'reason',
          placeholder: 'Berikan Alasan?'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
          }
        },
        {
          text: 'OK',
          handler: data => {
            this.doUpdateSlotDelivery(data)
          }
        }
      ]
    });
    alert.present();
  }
  doUpdateSlotDelivery(data) {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    this.api.put("table/slot_installation",
      {
        "uuid": this.kirim['uuid'],
        "to_description": data.reason,
        "time_pending": moment().format('YYYY-MM-DD HH:mm'),
        "status": 'PENDING',
      },
      { headers })
      .subscribe(
        (val) => {
          this.doGetKirimNew()
        });
  }
  doUpdateSlotDeliveryShipment() {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    this.api.put("table/slot_installation",
      {
        "uuid": this.kirim['uuid'],
        "time_shipment": moment().format('YYYY-MM-DD HH:mm'),
        "status": 'SHIPMENT',
      },
      { headers })
      .subscribe(
        (val) => {
          this.api.get("table/slot_installation", { params: { limit: 100, filter: "group_delivery_no='" + this.kirim['group_delivery_no'] + "' AND date_installation=" + "'" + moment().format('YYYY-MM-DD') + "'", sort: 'no_urut_group ASC' } })
            .subscribe(val => {
              this.datakirim = val['data']
            });
        });
  }
  doUpdateSlotDeliveryArrived() {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    this.api.put("table/slot_installation",
      {
        "uuid": this.kirim['uuid'],
        "time_arrived": moment().format('YYYY-MM-DD HH:mm'),
        "status": 'ARRIVED',
      },
      { headers })
      .subscribe(
        (val) => {
          this.api.get("table/slot_installation", { params: { limit: 100, filter: "group_delivery_no='" + this.kirim['group_delivery_no'] + "' AND date_installation=" + "'" + moment().format('YYYY-MM-DD') + "'", sort: 'no_urut_group ASC' } })
            .subscribe(val => {
              this.datakirim = val['data']
            });
        });
  }
  doUpdateSlotDeliveryDone() {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    this.api.put("table/slot_installation",
      {
        "uuid": this.kirim['uuid'],
        "status": 'DONE',
      },
      { headers })
      .subscribe(
        (val) => {
          this.doCloseCamera()
          this.api.get("table/slot_installation", { params: { limit: 100, filter: "group_delivery_no='" + this.kirim['group_delivery_no'] + "' AND date_installation=" + "'" + moment().format('YYYY-MM-DD') + "'", sort: 'no_urut_group ASC' } })
            .subscribe(val => {
              this.datakirim = val['data']
            });
        });
  }
  doUpdateSlotDeliveryCLSD() {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    this.api.put("table/slot_installation",
      {
        "uuid": this.kirim['uuid'],
        "time_finish": moment().format('YYYY-MM-DD HH:mm'),
        "status": 'CLSD',
      },
      { headers })
      .subscribe(
        (val) => {
          this.doGetKirimNew()
        });
  }
  doOpenCamera() {
    this.getfoto()
    this.camerashow = true;
  }
  doCloseCamera() {
    this.camerashow = false;
  }
  doGetKirimNew() {
    this.unlocked = true;
    this.api.get("table/slot_installation", { params: { limit: 100, filter: "group_delivery_no='" + this.kirim['group_delivery_no'] + "' AND date_installation=" + "'" + moment().format('YYYY-MM-DD') + "'", sort: 'no_urut_group ASC' } })
      .subscribe(val => {
        this.datakirim = val['data']
        navigator.geolocation.clearWatch(this.interval);
        navigator.geolocation.clearWatch(this.intervalcust);
        navigator.geolocation.clearWatch(this.locationupdate);
        this.app.getRootNav().setRoot('DetailpengirimanPage', {
          userid: this.userid,
          notruk: this.notruk,
          data: this.datakirim
        })
      }, err => {
        this.doGetKirimNew()
      });
  }
  doCamera() {
    let options: CameraOptions = {
      quality: 50,
      destinationType: this.camera.DestinationType.FILE_URI
    }
    options.sourceType = this.camera.PictureSourceType.CAMERA

    this.camera.getPicture(options).then((imageData) => {
      this.imageURI = imageData;
      this.imageFileName = this.imageURI;
      if (this.imageURI == '') return;
      let loader = this.loadingCtrl.create({
        content: "Uploading..."
      });
      loader.present();
      const fileTransfer: FileTransferObject = this.transfer.create();

      let uuid = UUID.UUID();
      this.uuid = uuid;
      let options: FileUploadOptions = {
        fileKey: 'fileToUpload',
        //fileName: this.imageURI.substr(this.imageURI.lastIndexOf('/') + 1),
        fileName: uuid + '.jpeg',
        chunkedMode: true,
        mimeType: "image/jpeg",
        headers: {}
      }

      let url = "http://101.255.60.202/qctesting/api/Upload";
      fileTransfer.upload(this.imageURI, url, options)
        .then((data) => {
          loader.dismiss();
          const headers = new HttpHeaders()
            .set("Content-Type", "application/json");
          this.api.post("table/link_image",
            {
              "no": this.uuid,
              "parent": this.kirim['uuid'],
              "table_name": "slot_installation",
              "img_src": 'http://101.255.60.202/qctesting/img/' + this.uuid,
              "file_name": this.uuid,
              "description": "",
              "latitude": "",
              "longitude": "",
              "location_code": '',
              "upload_date": moment().format('YYYY-MM-DD HH:mm:ss'),
              "upload_by": this.userid
            },
            { headers })
            .subscribe(
              (val) => {
                this.presentToast("Image uploaded successfully");
                this.api.get("table/link_image", { params: { limit: 100, filter: 'parent=' + "'" + this.kirim['uuid'] + "'" } }).subscribe(val => {
                  this.photos = val['data'];
                });
              });
          this.imageURI = '';
          this.imageFileName = '';
        }, (err) => {
          loader.dismiss();
          this.presentToast(err);
        });
    }, (err) => {
      this.presentToast(err);
    });
  }
  presentToast(msg) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: 'bottom'
    });

    toast.onDidDismiss(() => {

    });

    toast.present();
  }
  getfoto() {
    this.api.get("table/link_image", { params: { limit: 100, filter: 'parent=' + "'" + this.kirim['uuid'] + "'" } }).subscribe(val => {
      this.photos = val['data'];
    }, err => {
      this.getfoto()
    });
  }
  doSubmit() {
    this.status = '3'
    this.doUpdateSlotDeliveryDone()
  }

}
