const router = require("express").Router();
const { usernameVarmi, rolAdiGecerlimi } = require("./auth-middleware");
const { JWT_SECRET } = require("../secrets"); // bu secret'ı kullanın!
const { ekle } = require("../users/users-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/register", rolAdiGecerlimi, async (req, res, next) => {
  try {
    let hashedPassword = await bcrypt.hashSync(req.body.password, 8);
    let templete = {
      username: req.body.username,
      password: hashedPassword,
      role_name: req.body.role_name,
    };

    const newUser = await ekle(templete);
    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
  /**
    [POST] /api/auth/register { "username": "anna", "password": "1234", "role_name": "angel" }

    response:
    status: 201
    {
      "user"_id: 3,
      "username": "anna",
      "role_name": "angel"
    }
   */
});

router.post("/login", usernameVarmi, (req, res, next) => {
  try {
    if (bcrypt.compareSync(req.body.password, req.newusers.password)) {
      const payload = {
        subject: req.newusers.user_id,
        username: req.newusers.username,
        role_name: req.newusers.role_name,
      };
      const options = {
        expiresIn: "1d",
      };

      const createToken = jwt.sign(payload, JWT_SECRET, options);
      res.status(200).json({
        message: `${req.newusers.username} geri geldi!`,
        token: createToken,
      });
    } else {
      next({ status: 401, message: "Geçersiz kriter!" });
    }
  } catch (error) {
    next(error);
  }
  /**
    [POST] /api/auth/login { "username": "sue", "password": "1234" }

    response:
    status: 200
    {
      "message": "sue geri geldi!",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ETC.ETC"
    }

    Token 1 gün sonra timeout olmalıdır ve aşağıdaki bilgiyi payloadında içermelidir:

    {
      "subject"  : 1       // giriş yapan kullanıcının user_id'si
      "username" : "bob"   // giriş yapan kullanıcının username'i
      "role_name": "admin" // giriş yapan kulanıcının role adı
    }
   */
});

module.exports = router;
