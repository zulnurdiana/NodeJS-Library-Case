const express = require("express");
const epxressLayout = require("express-ejs-layouts");
const mysql = require("mysql");
const chalk = require("chalk");
const expressEjsLayouts = require("express-ejs-layouts");
const port = 3002;

const app = express();
app.set("view engine", "ejs");
app.use(expressEjsLayouts);
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

var db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "cuttielibrary",
});

db.connect((err) => {
  if (err) {
    console.error("error connecting: " + err.stack);
    return;
  } else {
    // Halaman Index
    app.get("/", (req, res) => {
      res.render("index", {
        title: "Mainhall",
        layout: "../layouts/template-main.ejs",
      });
    });

    // Halaman Dashboard
    app.get("/dashboard", (req, res) => {
      db.query(
        "SELECT id_mahasiswa,nama_mahasiswa,nama_buku,tanggal,id_pinjam FROM mahasiswa NATURAL JOIN peminjaman NATURAL JOIN buku ORDER BY tanggal DESC",
        (err, result) => {
          let hasil = JSON.parse(JSON.stringify(result));
          res.render("dashboard", {
            title: "Dashboard",
            layout: "../layouts/template-main.ejs",
            hasil,
          });
        }
      );
    });

    // Form Create
    app.get("/create", (req, res) => {
      db.query("SELECT * FROM mahasiswa", (err, result1) => {
        let mahasiswa = JSON.parse(JSON.stringify(result1));
        db.query(
          "SELECT id_buku,nama_buku FROM buku ORDER BY id_buku ASC",
          (err, result2) => {
            let buku = JSON.parse(JSON.stringify(result2));
            res.render("formtambah", {
              title: "Form Tambah",
              layout: "../layouts/template-main.ejs",
              buku,
              mahasiswa,
            });
          }
        );
      });
    });

    // Insert Form Create
    app.post("/create", (req, res) => {
      db.query(
        `INSERT INTO peminjaman(id_mahasiswa,id_buku,tanggal) VALUES('${
          req.body.id_mahasiswa
        }','${req.body.id_buku}','${new Date().toISOString().slice(0, 10)}');`,
        (err, result) => {
          res.redirect("/dashboard");
        }
      );
    });

    // delete by id_pinjam
    app.get("/delete/:id_pinjam", (req, res) => {
      db.query(
        `DELETE FROM peminjaman WHERE id_pinjam=${req.params.id_pinjam}`,
        (err, result) => {
          res.redirect("/dashboard");
        }
      );
    });

    // detail by id_pinjam
    app.get("/detail/:id_pinjam", (req, res) => {
      db.query(
        `SELECT id_mahasiswa,id_buku,nama_mahasiswa,nama_buku,tahun,tanggal FROM mahasiswa NATURAL JOIN peminjaman NATURAL JOIN buku WHERE id_pinjam=${req.params.id_pinjam}`,
        (err, result) => {
          let detail = JSON.parse(JSON.stringify(result));
          res.render("detail", {
            title: "Halaman Detail",
            layout: "../layouts/template-main.ejs",
            detail,
          });
        }
      );
    });

    // Dashboard Mahasiswa
    app.get("/dashboardmahasiswa", (req, res) => {
      db.query("SELECT * FROM mahasiswa", (err, result) => {
        let hasil = JSON.parse(JSON.stringify(result));
        res.render("dashboardmahasiswa", {
          title: "Halaman Detail",
          layout: "../layouts/template-main.ejs",
          hasil,
        });
      });
    });

    // Tambah Mahasiswa
    app.get("/createmahasiswa", (req, res) => {
      db.query(
        "SELECT id_mahasiswa FROM mahasiswa ORDER BY id_mahasiswa DESC LIMIT 1",
        (err, result) => {
          let id_mhs = JSON.parse(JSON.stringify(result));
          res.render("formtambahmahasiswa", {
            title: "Halaman Tambah Mahasiswa",
            layout: "../layouts/template-main.ejs",
            id_mhs,
          });
        }
      );
    });

    // Insert Form createmahasiswa
    app.post("/createmahasiswa", (req, res) => {
      db.query(
        `INSERT INTO mahasiswa(nama_mahasiswa) VALUES('${req.body.nama_mahasiswa}')`,
        (err, result) => {
          res.redirect("/dashboardmahasiswa");
        }
      );
    });

    // Delete mahasiswa
    app.get("/delete/mahasiswa/:id_mahasiswa", (req, res) => {
      db.query(
        `DELETE FROM mahasiswa WHERE id_mahasiswa=${req.params.id_mahasiswa}`,
        (err, result) => {
          res.redirect("/dashboardmahasiswa");
        }
      );
    });

    // Form Update Mahasiswa
    app.get("/update/mahasiswa/:id_mahasiwa", (req, res) => {
      db.query(
        `SELECT * FROM mahasiswa WHERE id_mahasiswa=${req.params.id_mahasiwa}`,
        (err, result) => {
          let mhs = JSON.parse(JSON.stringify(result));
          res.render("formupdatemahasiswa", {
            title: "Halaman Update Mahasiswa",
            layout: "../layouts/template-main.ejs",
            mhs,
          });
        }
      );
    });

    // Update From Mahasiswa
    app.post("/updatemahasiswa", (req, res) => {
      db.query(
        `UPDATE mahasiswa SET nama_mahasiswa='${req.body.nama_mahasiswa}' WHERE id_mahasiswa='${req.body.id_mahasiswa}'`,
        (err, result) => {
          res.redirect("/dashboardmahasiswa");
        }
      );
    });

    // Dashboard buku
    app.get("/dashboardbuku", (req, res) => {
      db.query("SELECT * FROM buku", (err, result) => {
        let buku = JSON.parse(JSON.stringify(result));
        res.render("dashboardbuku", {
          title: "Dashboard Buku",
          layout: "../layouts/template-main.ejs",
          buku,
        });
      });
    });

    // Form tambah buku
    app.get("/createbuku", (req, res) => {
      db.query(
        "SELECT id_buku FROM buku ORDER BY id_buku DESC LIMIT 1",
        (err, result) => {
          let id_buku = result;
          res.render("formtambahbuku", {
            title: "Form Tambah Buku",
            layout: "../layouts/template-main.ejs",
            id_buku,
          });
        }
      );
    });

    // Insert form buku
    app.post("/createbuku", (req, res) => {
      db.query(
        `INSERT INTO buku(nama_buku,tahun) VALUES('${req.body.nama_buku}','${req.body.tahun}')`,
        (err, result) => {
          res.redirect("/dashboardbuku");
        }
      );
    });

    // Delete buku
    app.get("/delete/buku/:id_buku", (req, res) => {
      db.query(
        `DELETE FROM buku where id_buku=${req.params.id_buku}`,
        (err, result) => {
          res.redirect("/dashboardbuku");
        }
      );
    });

    // Form Update buku
    app.get("/update/buku/:id_buku", (req, res) => {
      db.query(
        `SELECT * FROM buku WHERE id_buku=${req.params.id_buku}`,
        (err, result) => {
          let buku = JSON.parse(JSON.stringify(result));
          res.render("formupdatebuku", {
            title: "Form Update Buku",
            layout: "../layouts/template-main.ejs",
            buku,
          });
        }
      );
    });

    // Update form buku
    app.post("/updatebuku", (req, res) => {
      db.query(
        `UPDATE buku SET nama_buku='${req.body.nama_buku}',tahun='${req.body.tahun}' WHERE id_buku='${req.body.id_buku}'`,
        (err, result) => {
          res.redirect("/dashboardbuku");
        }
      );
    });

    // Console
    app.listen(port, () => {
      console.log(`app listening at ${chalk.red(`http://localhost:${port}`)}`);
    });

    // Void Route
    app.use("/", (req, res) => {
      res.send("<h1>Halaman belum dibuat!</h1>");
    });
  }
});
