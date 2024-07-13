const users = [
  { id: 1, name: "John Doe" },
  { id: 2, name: "Jane Doe" },
];

exports.getAllUsers = (req, res) => {
  if (!users?.length) {
    return res.status(404).json({ status: "fail", message: "No users found" });
  }
  return res.status(200).json({
    status: "success",
    requestedAt: req.requestTime,
    results: users.length,
    data: { users },
  });
};

exports.getUser = (req, res) => {
  const { id } = req.params;
  const foundUser = users.find((user) => user.id.toString() === id);

  if (!foundUser) {
    return res
      .status(404)
      .json({ status: "fail", message: "No user with that ID" });
  }

  res.status(200).json({
    status: "success",
    requestedAt: req.requestTime,
    data: { user: foundUser },
  });
};

exports.createUser = (req, res) => {
  const newId = users[users.length - 1].id * 1 + 1;

  const newUser = { id: newId, ...req.body };

  users.push(newUser);

  res.status(201).json({
    status: "success",
    data: { user: newUser },
  });
};

exports.updateUser = (req, res) => {
  const { id } = req.params;
  const foundUser = users.find((user) => user.id === id);
  if (!foundUser) {
    return res
      .status(404)
      .json({ status: "fail", message: "No user with that ID" });
  }
  // TODO: do some updating logic later
  const updatedUser = Object.assign(foundUser, req.body);

  return res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
};

exports.deleteUser = (req, res) => {
  const { id } = req.params;
  const foundUserIndex = users.findIndex((user) => user.id === id);

  if (foundUserIndex === -1) {
    return res
      .status(404)
      .json({ status: "fail", message: "No user with that ID" });
  }

  // TODO: do some deleting logic later
  users.splice(foundUserIndex, 1);

  return res.status(204).json({
    status: "success",
    data: null,
  });
};
