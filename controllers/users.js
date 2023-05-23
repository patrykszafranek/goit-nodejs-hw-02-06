const jwt = require("jsonwebtoken");
const Users = require("../repository/users");
const path = require("path");
const mkdirp = require("mkdirp");
const { HttpCode } = require("../config/constants");
const UploadService = require("../service/file-upload");
const EmailService = require("../service/email/service");
const { CreateSenderSendGrid } = require("../service/email/sender");
require("dotenv").config();
const SECRET_KEY = process.env.JWT_SECRET_KEY;

const signup = async (req, res, next) => {
  const { name, email, password, subscription } = req.body;
  const user = await Users.findByEmail(email);
  if (user) {
    return res.status(HttpCode.CONFLICT).json({
      status: "error",
      code: HttpCode.CONFLICT,
      message: "Email is already exist",
    });
  }
  try {
    const newUser = await Users.create({ name, email, password, subscription });
    const emailService = new EmailService(
      process.env.NODE_ENV,
      new CreateSenderSendGrid()
    );
    const statusEmail = await emailService.sendVerifyEmail(
      newUser.email,
      newUser.name,
      newUser.verifyToken
    );

    return res.status(HttpCode.CREATED).json({
      status: "success",
      code: HttpCode.CREATED,
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        subscription: newUser.subscription,
        avatar: newUser.avatar,
        successEmail: statusEmail,
      },
    });
  } catch (e) {
    next(e);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await Users.findByEmail(email);
  const isValidPassword = await user.isValidPassword(password);

  if (!user || !isValidPassword || !user?.isVerified) {
    return res.status(HttpCode.UNAUTHORIZED).json({
      status: "error",
      code: HttpCode.UNAUTHORIZED,
      message: "Email or password is wrong",
    });
  }

  const id = user._id;
  const payload = { id };
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" });
  await Users.updateToken(id, token);

  return res.status(HttpCode.OK).json({
    status: "success",
    code: HttpCode.OK,
    data: { token },
  });
};

const logout = async (req, res, next) => {
  const id = req.user._id;
  await Users.updateToken(id, null);
  return res.status(HttpCode.NO_CONTENT).json({});
};

// ! Local Storage
const uploadAvatar = async (req, res, next) => {
  const id = String(req.user._id);
  const file = req.file;
  const UPLOAD_DIR = process.env.UPLOAD_DIR;
  const destination = path.join(UPLOAD_DIR, id);
  await mkdirp(destination);

  const uploadService = new UploadService(destination);
  const avatarUrl = await uploadService.save(file, id);
  await Users.updateAvatar(id, avatarUrl);

  return res.status(HttpCode.OK).json({
    status: "success",
    code: HttpCode.OK,
    data: { avatar: avatarUrl },
  });
};

const verifyUser = async (req, res, next) => {
  const user = await Users.findUserByVerifyToken(req.params.token);
  if (user) {
    await Users.updateTokenVerify(user._id, true, null);
    return res.status(HttpCode.OK).json({
      status: "success",
      code: HttpCode.OK,
      data: {
        message: "Success",
      },
    });
  }
  return res.status(HttpCode.NOT_FOUND).json({
    status: "error",
    code: HttpCode.NOT_FOUND,
    message: "Invalid token",
  });
};

const repeatEmailForVerifyUser = async (req, res, next) => {
  const { email } = req.body;
  const user = await Users.findByEmail(email);
  if (user) {
    const { email, name, verifyToken: verificationToken } = user;
    const emailService = new EmailService(
      process.env.NODE_ENV,
      new CreateSenderSendGrid()
    );
    await emailService.sendVerifyEmail(email, name, verificationToken);
    return res.status(HttpCode.OK).json({
      Status: 200,
      ContentType: "application/json",
      ResponseBody: {
        message: "Verification email sent",
      },
    });
  }
  return res.status(HttpCode.BAD_REQUEST).json({
    Status: 400,
    ContentType: "application/json",
    ResponseBody: {
      message: "User is not found. Verification email was not sent",
    },
  });
};

module.exports = {
  signup,
  login,
  logout,
  uploadAvatar,
  verifyUser,
  repeatEmailForVerifyUser,
};
