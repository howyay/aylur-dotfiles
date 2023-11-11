import * as Utils from 'resource:///com/github/Aylur/ags/utils.js';
import Service from 'resource:///com/github/Aylur/ags/service.js';

class Asusctl extends Service {
    static {
        Service.register(this, {}, {
            'profile': ['string', 'r'],
            'mode': ['string', 'r'],
        });
    }

    #profile = 'Balanced';

    nextProfile() {
        Utils.execAsync('asusctl profile -n')
            .then(() => {
                this.#profile = Utils.exec('asusctl profile -p').split(' ')[3];
                this.changed('profile');
            })
            .catch(console.error);
    }

    /** @param {'Performance' | 'Balanced' | 'Quiet'} prof */
    setProfile(prof) {
        Utils.execAsync(`asusctl profile --profile-set ${prof}`)
            .then(() => {
                this.#profile = prof;
                this.changed('profile');
            })
            .catch(console.error);
    }

    nextMode() {
        Utils.execAsync(`supergfxctl -m ${this._mode === 'Hybrid' ? 'Integrated' : 'Hybrid'}`)
            .then(() => {
                this._mode = Utils.exec('supergfxctl -g');
                this.changed('profile');
            })
            .catch(console.error);
    }

    constructor() {
        super();

        if (Utils.exec('which asusctl')) {
            this.available = true;
            this.#profile = Utils.exec('asusctl profile -p').split(' ')[3];
            Utils.execAsync('supergfxctl -g').then(mode => this._mode = mode);
        }
        else {
            this.available = false;
        }
    }

    /** @returns {['Performance', 'Balanced', 'Quiet']} */
    get profiles() { return ['Performance', 'Balanced', 'Quiet']; }
    get profile() { return this.#profile; }
    get mode() { return this._mode || 'Hybrid'; }
}

export default new Asusctl();
