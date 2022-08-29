const express = require("express");
const epxressLayout = require("express-ejs-layouts");
const mysql = require("mysql");
const chalk = require("chalk");
const expressEjsLayouts = require("express-ejs-layouts");
const port = 3001;

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
