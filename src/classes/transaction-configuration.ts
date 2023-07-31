class Typology {
  id = '';
  cfg = '';
  threshold = 0;
}

class Channel {
  id = '';
  cfg = '';
  typologies: Typology[] = [];
}

export class Message {
  id = '';
  cfg = '';
  txTp = '';
  channels: Channel[] = [];
}

export class TransactionConfiguration {
  messages: Message[] = [];
}
