const handleRegister = async (req, res, authenticate, User, jwt, dotenv, knexDb, upload) => {
	dotenv.config();

	let brugerAuth = null
	const response = (reply, status) => res.status(status).send(reply);
	const hvis = (decoded) => {
		return decoded.role === 'FORMAND' || decoded.role === 'ADMIN'
	}
	const t = await authenticate(req, res, jwt, hvis, brugerAuth)

	//*/
	if (!t) {
		response({ message: 'nix', error: true }, 401)
	} else {
		upload(req, res, (err) => {
			if (err) {
				res.status(400).json({ message: err });
			} else {
				const { email, password, titel, fornavn, mellemnavn, efternavn } = req.body;
				const billedeNavn = req.file.filename
				const role = () => {
					switch (titel) {
						case 'admin': return 'ADMIN';
						case 'Formand': return 'FORMAND';
						case 'Sekretær': return 'SKRIV';
						case 'Kasserer' || 'Bogholder': return 'KASSE';
						case 'Næstformand' || 'Medlem': return 'MEDLEM';
						default: return 'BRUGER';
					}
				}

				const table = 'bruger';

				const rang = () => {
					let rangnr = 0;
					switch (titel) {
						case 'Formand': rangnr = 1;
							break
						case 'Næstformand': rangnr = 2;
							break;
						case 'Sekretær': rangnr = 3;
							break;
						case 'Kasserer': rangnr = 4;
							break;
						case 'Bogholder': rangnr = 5;
							break;
						case 'Supleant': rangnr = 6;
							break;
						default: rangnr = 7;
							break;
					}
					return rangnr;
				}

				const newUser = async () => {
					const user = new User({
						fornavn: fornavn,
						email: email,
						password: password,
						role: role(),
						titel: titel,
						mellemnavn: mellemnavn,
						efternavn: efternavn,
						rang: rang(),
						billede: billedeNavn
					});
					return await user.save().then((newUser) => {
						const load = { role: newUser.role, id: newUser.id }
						const token = jwt.sign(load, process.env.SECRET_OR_KEY);
						const payload = { token: token, load };
						res.status(200).json(payload);
					});
				}

				const m = 'email';
				const jsont = (t) => JSON.stringify(t[0].email);
				const where = (first, second) => knexDb(table).where(first, second);

				where(m, email).then((bruger) => {
					if (bruger.length != 0) {
						return response('mail ' + jsont(bruger), 409)
					} else {
						try {
							newUser()
						} catch (e) {
							if (e.errno == 1062) {
								return response({
									error: true,
									message: 'duplicate entry'
								}, 409)
							} else {
								return response({
									error: true,
									message: 'an error accurred ' + e
								}, 409)
							}
						}
					}
				}).catch((e) => response({
					error: true,
					message: 'error ' + e
				}, 409));//*/
			}
		});
	}
}

module.exports = {
	handleRegister
};
