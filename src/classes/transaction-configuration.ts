class Typology {
  id = '';
  threshold = 0;
}

class Channel {
  id = '';
  typologies: Array<Typology> = [];
}

export class Message {
  id = '';
  cfg = '';
  txTp = '';
  channels: Array<Channel> = [];
}

export class TransactionConfiguration {
  messages: Array<Message> = [];
}
