import { Plugin as OPlugin } from '@oclif/config/lib/plugin'

class PrePlugin extends OPlugin {
  constructor(options){
    super(options);

    this.commandList = options.commands || {};
  }

  findCommand (id) {
    const cmd = this.commandList[id];
    cmd.id = id;
    cmd.plugin = this;
    return cmd;
  }

  get commandIDs () {
    return Object.keys(this.commandList);
  }
}

export default PrePlugin;