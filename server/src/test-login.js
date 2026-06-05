async function login(req, res) {
  const user = await User.findOne({ email: req.body.email });
  const token = jwt.sign({ id: user._id }, 'hardcoded-secret');
  res.json({ token, user });
}"// trigger review" 
