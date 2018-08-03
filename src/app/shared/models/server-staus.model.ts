export class ServerStaus {
  server: string;
  status: string;
  verified: string;
  language: string;

  constructor(server: string, status: string, language: string, verified: string) {
    this.server = server;
    this.status = status;
    this.verified = verified;
    this.language = language;
  }
}

