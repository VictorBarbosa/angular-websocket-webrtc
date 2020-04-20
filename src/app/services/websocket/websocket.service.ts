import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  private ws!: WebSocket;
  private peerConnection!: RTCPeerConnection;
  user!: string;
  user2!: string;
  inputMediaStream!: MediaStream;
  outputMediaStream!: MediaStream;

  constructor() {

    this.peerConnection = new RTCPeerConnection();

    this.ws = new WebSocket('ws://192.168.1.14:8088');
    this.ws.onclose = (e) => this.close(e);
    this.ws.onopen = (e) => this.open(e);
    this.ws.onerror = (e) => this.error(e);
    this.ws.onmessage = (e) => this.message(e);
  }
  async turnOnCam({ audio, video }: { audio: boolean; video: boolean; }): Promise<MediaStream> {
    this.inputMediaStream = await navigator.mediaDevices.getUserMedia({ audio, video });
    return this.inputMediaStream;
  }

  async  Initializate() {

    this.peerConnection.onicecandidate = (e) => {
      if (!this.peerConnection || !e || !e.candidate) { return; }
      const candidate = e.candidate;
      this.sendNegotiation('candidate', candidate);

    };

    this.inputMediaStream.getTracks().forEach(track => {
      this.peerConnection.addTrack(track);
    });

    const offerOptions = {
      offerToReceiveAudio: false,
      offerToReceiveVideo: false
    };
    const offer = await this.peerConnection.createOffer(offerOptions);
    this.peerConnection.setLocalDescription(offer)
    this.sendNegotiation('offer', offer);


  }
  message(e: any) {

    const json = JSON.parse(e.data);
    if (json.action === 'candidate') {
      if (json.to === this.user) {
        this.processIce(json.data);
      }
    } else if (json.action === 'offer') {
      // incoming offer
      if (json.to === this.user) {
        this.user2 = json.from;
        this.processOffer(json.data)
      }
    } else if (json.action === 'answer') {
      // incoming answer
      if (json.to === this.user) {
        this.processAnswer(json.data);
      }
    }

  }

  error(e: any) {

  }
  open(e: any) {



  }
  close(e: any) {

  }


  sendNegotiation(type: any, sdp: any) {
    const json = { from: this.user, to: this.user2, action: type, data: sdp };
    this.ws.send(JSON.stringify(json));
    console.log(`Sending [${this.user}] to [${this.user2}]: ${JSON.stringify(sdp)}`);
  }
  processIce(candidate: any) {
    this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  }
  processAnswer(answer: any) {
    debugger
    this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  }
  async processOffer(offer: any) {
    this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer)).catch(erro => { });

    this.peerConnection.addEventListener('track', (e) => {

      if (!this.outputMediaStream) {
        this.outputMediaStream = new MediaStream();
      }
      this.outputMediaStream.addTrack(e.track)
      // video.srcObject = this.inputMediaStream;
      // video.play();
    });

    const offerOptions = {
      offerToReceiveAudio: false,
      offerToReceiveVideo: false
    };
    const sdp = await this.peerConnection.createAnswer(offerOptions);
    await this.peerConnection.setLocalDescription(sdp);
    this.sendNegotiation('answer', sdp);

  }

}
