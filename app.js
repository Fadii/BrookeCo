const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bodyParser = require("body-parser");

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "fadi1234",
    database: "Brooke"
});


const app = express();
const port = 3000;
app.use(cors());
app.use(bodyParser.json());


app.get("/", function(request, response){
    response.send("Bienvenue chez Brooke et co")
});
app.listen(port);

app.get("/getAllProducts", function(request, response){
  
    con.connect(function(err){
    if(err) throw err;
    con.query("SELECT * FROM Produit", function (err, result, fields){
        if(err) throw err;
        console.log(JSON.stringify(result));
        response.status(200).json(result);
    });
    });
});
app.get("/getProduct/:id", function(request, response){
    const id = request.params.id;
    
    con.connect(function(err){
    if(err) throw err;
    con.query("SELECT * FROM Produit where idproduit=" + id, function (err, result, fields){
        if(err) throw err;
        if(result.length > 0){
            console.log(JSON.stringify(result[0]));
            response.status(200).json({
                message : "produit(s) trouvé(s)",
                data : result[0]
            });


        }
        else{
            console.log("produit non trouvé");
            response.status(200).json({
                message: "Aucun produit trouvé",
                data : {}
            });
        }
      
    });
    });
});
app.post("/createProduct", function(request, response){
    const produit = request.body;
    //console.log(produit.description + " " + produit.image + " " + produit.prix + " " + produit.details);
    console.log(JSON.stringify(produit));

    const con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "fadi1234",
        database: "Brooke"
    });
    con.connect(function(err){
        con.query("INSERT INTO Produit values(null, '" + produit.image + "', '" + produit.nomproduit + "', '" + produit.details + "', " + produit.prix + ",'"+produit.fournisseur +"'," + produit.idsouscategorie+ ");", function (err, result, fields){
            if(err) throw err;
            response.status(200).send("Produit ajouté");
        });
    });
});
app.put("/updateProduct/:id", function(request, response){
    const id = request.params.id;
    const produit = request.body;
    //console.log(produit.description + " " + produit.image + " " + produit.prix + " " + produit.details);
    console.log(JSON.stringify(produit));

    const con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "fadi1234",
        database: "Brooke"
    });

    con.connect(function(err){
        con.query("UPDATE Produit set image = '" + produit.image + "', nomproduit = '" + produit.nomproduit + "', details ='" + produit.details + "', prix =" + produit.prix +", fournisseur ='" + produit.fournisseur  + "', idsouscategorie=" + produit.idsouscategorie +" where idproduit=" + id, function (err, result, fields){
            if(err) throw err;
            response.status(200).send("Produit modifié");
        });
   });
});

app.delete("/deleteProduct/:id", function(request, response){
    const id = request.params.id;
    con.connect(function(err){
        if(err) throw err;
        con.query("DELETE FROM Produit where idproduit=" + id, function(err, result, fields) {
            if (err) throw err;
            response.status(200).send("Produit supprimé");
        });
    });
});

app.post("/createClient", function(request, response){
    var myid = 0;
    const utilisateur = request.body;

    con.connect(function(err){
        
        con.query("INSERT INTO Utilisateur values(null, '" + utilisateur.username + "', '" + utilisateur.password + "'); " , function (err, result, fields){
           
            if(err) throw err;
        });
        
        con.query("SELECT last_insert_id() as uu;", function (err, result, fields){
            if(err) throw err;
            
            myid = (result[0].uu);
        
            tableClient();
        });
        function tableClient(){
        con.connect(function(err){
           console.log("id est " + myid );
        var unquery = "INSERT INTO Client values('" + utilisateur.nom + "', '" + utilisateur.prenom + "', '" + utilisateur.telephone + "', '" + utilisateur.addresse + "','"+ utilisateur.courriel +"', "+ myid +");";
        con.query(unquery , function (err, result, fields){
            if(err) throw err;
            response.status(200).json("Client ajouté");
        });});}

});
});
app.get("/getLivres/:id", function(request, response){
    const id = request.params.id;
    con.connect(function(err){
    if(err) throw err;
    con.query("SELECT P.idproduit, P.image, P.nomproduit, P.details, P.prix, P.fournisseur, S.idCategorie FROM produit P join souscategorie S on S.idSousCategorie = P.idSousCategorie where S.idCategorie = 1 and S.nomSousCategorie ='" + id+"';", function (err, result, fields){
        if(err) throw err;
        if(result.length > 0){
            console.log(JSON.stringify(result[0]));
            response.status(200).json({
                message : "produit(s) trouvé(s)",
                data : result
            });
        }
        else{
            console.log("produit non trouvé");
            response.status(200).json({
                message: "Aucun produit trouvé",
                data : {}
            });
        }
      
    });
    });
});

app.post("/createCommande", function(request, response){
    var idCommande = 0;
    var sqlcommande = "";
    const commande = request.body;

    con.connect(function(err){
        var anotherpanier = {};
        anotherpanier = commande.panier;
        //console.log("le contenu du panier : "+ anotherpanier);
        
        con.query("INSERT INTO Commande values(null, '" + commande.dateCommande + "', '" + commande.etat + "', " + commande.idClient + "); " , function (err, result, fields){
           
            if(err) throw err;
        });
        
        con.query("SELECT last_insert_id() as uu;", function (err, result, fields){
            if(err) throw err;
            
            idCommande = (result[0].uu);
            for(var i=0;i<anotherpanier.length;i++){
                
                sqlcommande = "INSERT INTO LigneCommande (LigneCommande.prixReel, LigneCommande.quantite, LigneCommande.idProduit, LigneCommande.idCommande) values (" + anotherpanier[i].prix + "," + anotherpanier[i].quantite +" , "+ commande.idClient + " , "+ idCommande + "); "
                tableLigneCommande(sqlcommande);                 
            }
            tableLigneCommande(sqlcommande);
        });
        function tableLigneCommande(sqlcommande){
        con.connect(function(err){
           //console.log("id est " + idCommande );
        var unquery = "INSERT INTO LigneCommande (LigneCommande.prixReel, LigneCommande.quantite, LigneCommande.idProduit, LigneCommande.idCommande) SELECT prix , 5 , 2, " + idCommande +" FROM Produit where idProduit = 2;";
        con.query(sqlcommande , function (err, result, fields){
            if(err) throw err;
            response.status(200).send("commande ajouté");
        });});}

});
});
app.post("/login", function(request, response){
    var myid = 0;
    const utilisateur = request.body;

    con.connect(function(err){
        
        con.query("SELECT * from utilisateur where username = '" + utilisateur.username + "' and password = '" + utilisateur.password + "';", function (err, result, fields){
           
            if(err) throw err;
            if(result.length > 0){
                console.log(JSON.stringify(result[0]));
                response.status(200).json({
                    message : "connecté",
                    data : result[0]
                });
    
    
            }
            else{
                console.log("mot de passe invalide");
                response.status(200).json({
                    message: "mot de passe invalide",
                    data : {}
                });
            }
        });
        
      
       

});
});
