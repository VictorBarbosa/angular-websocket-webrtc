import { Component, ViewChild, ElementRef } from '@angular/core';
import { WebsocketService } from './services/websocket/websocket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  @ViewChild('localVideo', { static: true }) localVideo: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo', { static: true }) remoteVideo: ElementRef<HTMLVideoElement>;
  constructor(private ws: WebsocketService) { }

  /**
   * 
   */
  public async camTunrOn() {
    this.localVideo.nativeElement.srcObject = await this.ws.turnOnCam({ audio: false, video: true });

  }

}
