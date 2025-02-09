const { JWT_SECRET } = require("../secrets/"); // bu secreti kullanın!

const jwt = require("jsonwebtoken");
const { goreBul } = require("../users/users-model");

const sinirli = (req, res, next) => {
  try {
    let auth = req.headers["authorization"];
    if (!auth) {
      next({
        status: 401,
        message: "Token gereklidir",
      });
    } else {
      jwt.verify(auth, JWT_SECRET, (err, decoded) => {
        if (err) {
          next({
            status: 401,

            message: "Token gecersizdir",
          });
        } else {
          req.decoded = decoded;
          next();
        }
      });
    }
  } catch (error) {
    next(error);
  }
  /*
    Eğer Authorization header'ında bir token sağlanmamışsa:
    status: 401
    {
      "message": "Token gereklidir"
    }

    Eğer token doğrulanamıyorsa:
    status: 401
    {
      "message": "Token gecersizdir"
    }

    Alt akıştaki middlewarelar için hayatı kolaylaştırmak için kodu çözülmüş tokeni req nesnesine koyun!
  */
};

const sadece = (role_name) => (req, res, next) => {
  try {
    if (req.decoded.role_name !== role_name) {
      next({
        status: 403,

        message: "Bu, senin için değil",
      });
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
  /*
    
	Kullanıcı, Authorization headerında, kendi payloadu içinde bu fonksiyona bağımsız değişken olarak iletilen 
	rol_adı ile eşleşen bir role_name ile bir token sağlamazsa:
    status: 403
    {
      "message": "Bu, senin için değil"
    }

    Tekrar authorize etmekten kaçınmak için kodu çözülmüş tokeni req nesnesinden çekin!
  */
};

const usernameVarmi = async (req, res, next) => {
  try {
    const isContain = await goreBul({ username: req.body.username });
    if (isContain.length === 0) {
      next({
        status: 401,
        message: "Geçersiz kriter",
      });
    } else {
      req.newusers = isContain[0];
      next();
    }
  } catch (error) {
    next(error);
  }
  /*
    req.body de verilen username veritabanında yoksa
    status: 401
    {
      "message": "Geçersiz kriter"
    }
  */
};

const rolAdiGecerlimi = (req, res, next) => {
  /*
    Bodydeki rol_name geçerliyse, req.role_name öğesini trimleyin ve devam edin.
    Req.body'de role_name eksikse veya trimden sonra sadece boş bir string kaldıysa,
    req.role_name öğesini "student" olarak ayarlayın ve isteğin devam etmesine izin verin.
    Stringi trimledikten sonra kalan role_name 'admin' ise:
    status: 422
    {
      "message": "Rol adı admin olamaz"
    }
    Trimden sonra rol adı 32 karakterden fazlaysa:
    status: 422
    {
      "message": "rol adı 32 karakterden fazla olamaz"
    }
  */
  try {
    if (!req.body.role_name || req.body.role_name.trim() === "") {
      req.body.role_name = "student";
      next();
    } else if (req.body.role_name.trim() === "admin") {
      next({
        status: 422,
        message: "Rol adı admin olamaz",
      });
    } else if (req.body.role_name.trim().length > 32) {
      next({
        status: 422,
        message: "rol adı 32 karakterden fazla olamaz",
      });
    } else {
      req.body.role_name = req.body.role_name.trim();
      next();
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sinirli,
  usernameVarmi,
  rolAdiGecerlimi,
  sadece,
};
