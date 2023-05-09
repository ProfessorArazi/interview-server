const User = require("./src/Models/user");

const getUser = async (data) => {
  const { token, id } = data;
  const user = await User.findById(id);
  if (!user.token === token) {
    return res.status(401).send({ message: "unauthorized" });
  }
  return user
};

module.exports = { getUser };
