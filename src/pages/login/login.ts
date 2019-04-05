import { Component, ElementRef, ViewChild } from '@angular/core';
import { AlertController, App, IonicPage, NavController, LoadingController, NavParams } from 'ionic-angular';
import { ApiProvider } from '../../providers/api/api';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Storage } from '@ionic/storage';
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

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  myForm: FormGroup;
  public loading: any;
  public truck: any;
  public notruck: any;
  public idtruck: any;
  public token: any;
  public pengiriman = [];
  public interval: any;

  constructor(
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    public app: App,
    public loadingCtrl: LoadingController,
    public fb: FormBuilder,
    public navParams: NavParams,
    public storage: Storage,
    public api: ApiProvider,
    public backgroundMode: BackgroundMode,
    private insomnia: Insomnia) {
    this.insomnia.keepAwake()
      .then(
        () => console.log('success'),
        () => console.log('error')
      );
    this.backgroundMode.enable();
    this.myForm = fb.group({
      userid: [''],
      password: ['']
    })
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    this.loading.present().then(() => {
      this.loading.dismiss()
    });

  }
  doLogin() {
    const headers = new HttpHeaders()
      .set("Content-Type", "application/json");
    this.api.post("token",
      {
        "userid": this.myForm.value.userid,
        "password": this.myForm.value.password
      },
      { headers })
      .subscribe((val) => {
        this.token = val['token'];
        this.doGetKirim()
      }, err => {
        let alert = this.alertCtrl.create({
          subTitle: 'Password salah',
          buttons: ['OK']
        });
        alert.present();
        this.myForm.get('password').setValue('')
      });
  }
  doGetKirim() {
    this.api.get("table/route_header", { params: { limit: 100, filter: "id_installer='" + this.myForm.value.userid + "' AND date_delivery=" + "'" + moment().format('YYYY-MM-DD') + "'" } })
      .subscribe(val => {
        let dataheader = val['data']
        this.api.get("table/slot_installation", { params: { limit: 100, filter: "group_delivery_no='" + dataheader[0].group_route_no + "' AND date_installation=" + "'" + moment().format('YYYY-MM-DD') + "'", sort: 'no_urut_group ASC' } })
          .subscribe(val => {
            let data = val['data']
            this.api.get("table/slot_installation", { params: { limit: 100, filter: "group_delivery_no='" + dataheader[0].group_route_no + "' AND date_installation=" + "'" + moment().format('YYYY-MM-DD') + "' AND (status !='OPEN' AND status !='PENDING' AND status !='CLSD')", sort: 'no_urut_group ASC' } })
              .subscribe(val => {
                let status = val['data']
                if (status.length != 0) {
                  this.app.getRootNav().setRoot('MapsPage', {
                    userid: this.myForm.value.userid,
                    notruk: dataheader[0].plat_no,
                    kirim: status[0],
                    datakirim: data
                  });
                }
                else {
                  this.app.getRootNav().setRoot('DetailpengirimanPage', {
                    notruk: dataheader[0].plat_no,
                    userid: this.myForm.value.userid,
                    data: data
                  })
                }
              });
          });
      });
  }
}
