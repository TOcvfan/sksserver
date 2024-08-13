const handleSignin = (req, res, knexDb, bcrypt, jwt, dotenv) => {
	dotenv.config();
	const { email, password } = req.body;
	if (!email || !password) {
		return res.status(400).json('incorrect form submission');
	}
	//
	const table = 'bruger'
	//console.log(password)
	const loadUser = () => {
		return knexDb.select('id', 'fornavn', 'email', 'role', 'mellemnavn', 'efternavn', 'titel', 'billede').from(table)
			.where('email', '=', email)
			.then(user => {
				const id = user[0].id;
				const fornavn = user[0].fornavn;
				const email = user[0].email;
				const role = user[0].role;
				const mellemnavn = user[0].mellemnavn;
				const efternavn = user[0].efternavn;
				const titel = user[0].titel;
				const billede = user[0].billede;
				const token = jwt.sign({ role, id }, process.env.SECRET_OR_KEY);
				const payload = { role, auth: true, token, id, fornavn, email, mellemnavn, efternavn, titel, billede };
				res.status(200).send(payload);
			})
			.catch(err => res.status(400).json('unable to get user ' + err))
	}

	knexDb.select('email', 'userpassword').from(table)
		.where('email', '=', email)
		.then(data => {
			data[0] === undefined ? res.status(400).send('email') : (
				bcrypt.compareSync(password, data[0].userpassword) === true ?
					loadUser() : res.status(400).send('password'))
		})
		.catch(err => res.status(400).json(err));
}


module.exports = {
	handleSignin
};