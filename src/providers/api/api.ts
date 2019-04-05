import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

/*
  Generated class for the ApiProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ApiProvider {

  private api_url = 'http://101.255.60.202/qctesting/api';
  private api_rds = 'http://101.255.60.202/rdsapi/api';
  private api_get_token = 'http://101.255.60.202/api/';
  private api_send_sms = 'http://101.255.60.202/api/';

  constructor(public http: HttpClient) {
  }

  get(endpoint: string, params?: any) {
    return this.http.get(this.api_url + '/' + endpoint, params);
  }

  post(endpoint: string, body: any, reqOpts?: any) {
    return this.http.post(this.api_url + '/' + endpoint, body, reqOpts)
  }
  put(endpoint: string, body: any, reqOpts?: any) {
    return this.http.put(this.api_url + '/' + endpoint, body, reqOpts);
  }

  delete(endpoint: string, reqOpts?: any) {
    return this.http.delete(this.api_url + '/' + endpoint, reqOpts);
  }

  patch(endpoint: string, body: any, reqOpts?: any) {
    return this.http.patch(this.api_url + '/' + endpoint, body, reqOpts);
  }
  gettokensms(endpoint: string, body: any, reqOpts?: any) {
    return this.http.post(this.api_get_token + '/' + endpoint, body, reqOpts)
  }
  postsendsms(endpoint: string, body: any, reqOpts?: any) {
    return this.http.post(this.api_send_sms + '/' + endpoint, body, reqOpts)
  }

  getRds(endpoint: string, params?: any) {
    return this.http.get(this.api_rds + '/' + endpoint, params);
  }

  postRds(endpoint: string, body: any, reqOpts?: any) {
    return this.http.post(this.api_rds + '/' + endpoint, body, reqOpts)
  }
  putRds(endpoint: string, body: any, reqOpts?: any) {
    return this.http.put(this.api_rds + '/' + endpoint, body, reqOpts);
  }

  deleteRds(endpoint: string, reqOpts?: any) {
    return this.http.delete(this.api_rds + '/' + endpoint, reqOpts);
  }
}
