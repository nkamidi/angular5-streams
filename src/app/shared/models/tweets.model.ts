export class Tweet {
  tweet: string;
  user: string;
  reTweetCount: string;
  createdTimestamp: number;
  createdDate: string;
  verified: string;
  language: string;

  constructor(tweet: string, user: string, reTweetCount: string, createdTimestamp: number, verified: string, language: string) {
    let dt;

    this.tweet = tweet;
    this.user = user;
    this.reTweetCount = reTweetCount;
    this.createdTimestamp = createdTimestamp;
    dt = new Date(Math.round(this.createdTimestamp/1000));
    this.createdDate = ('0' + dt.getDate()).substr(-2) + '-' + ('0' + (dt.getMonth() + 1)).substr(-2) + '-' + dt.getFullYear();
    this.verified = verified;
    this.language = language;
  }
}

