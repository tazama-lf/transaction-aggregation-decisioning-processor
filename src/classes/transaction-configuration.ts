class Typology {
  id = '';
  cfg = '';
  threshold = 0;
}

class Channel {
  id = '';
  cfg = '';
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
