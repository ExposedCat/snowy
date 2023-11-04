export class Config {
	constructor(settings) {
		this.settings = settings
	}

	int(name) {
		return this.settings.get_int(name)
	}

	string(name) {
		return this.settings.get_string(name)
	}
}
