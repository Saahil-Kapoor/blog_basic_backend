
import express, { json } from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';

const db = new sqlite3.Database(':memory:');
 
const app = express();
const port = 5000;
app.use(cors());
app.use(express.json());
const router = express.Router();

// Create a table
db.serialize(() => {
    db.run("CREATE TABLE blogs (id integer primary key AUTOINCREMENT NOT NULL, name varchar(50),title varchar(200) , content varchar(1000))");
  
    // Insert data into the table
    /*
    const stmt = db.prepare("INSERT INTO users VALUES (?, ?)");
    stmt.run(1, 'Saahil');
    stmt.run(2, 'John');
    stmt.finalize();
  
    // Query data from the table
    db.each("SELECT id, name FROM users", (err, row) => {
      if (err) {
        console.error(err.message);
      }
      console.log(`ID: ${row.id}, Name: ${row.name}`);
    });
  });
  
  // Close the database
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Closed the database connection.');
    */
  });

router.get('/posts',(req,res)=>{
    db.all("select * from blogs",(error,rows)=>{
        if(error){
            return res.status(403).send("not successfull")
        }
        console.log(rows);
        return res.status(200).json(rows);
    })
})

router.get('/posts/:id',(req,res)=>{
    const id = req.params.id;
    console.log(id);
    db.get("select * from blogs where id = $id",{
        $id:id
    },(error,rs)=>{
        if(error){
            return res.status(403).json({
                "success":false
            })
        }
        else{
            console.log(rs);
            res.status(200).json(rs);
        }
    })
})

router.post('/posts',(req,res)=>{
    const {name,title,content} = req.body;
    db.run("INSERT INTO blogs (name,title,content) VALUES (?,?,?)",
    [name,title,content]);
    res.json({message:"Post created successfully"});
})

router.post('/posts/:id', (req, res) => {
    const id = req.params.id;

    // db.get is asynchronous, so all logic using `rs` should be inside the callback
    db.get("SELECT * FROM blogs WHERE id = $id", { $id: id }, (error, rs) => {
        if (error) {
            console.log(error.message);
            return res.status(500).json({
                "success": false,
                "message": "Database error"
            });
        }

        // If no record is found
        if (!rs) {
            return res.status(404).json({
                "success": false,
                "message": "Record not found"
            });
        }

        // If record exists, proceed to delete
        db.run("DELETE FROM blogs WHERE id = ?", id, function (error) {
            if (error) {
                console.log(error.message);
                return res.status(403).json({
                    "success": false,
                    "message": "Cannot perform the operation, try again"
                });
            }
            console.log("Row is deleted");
            return res.status(200).json({
                "success": true,
                "message": "Record successfully deleted"
            });
        });
    });
});


app.use(router);

app.listen(port,(error)=>{
    if(error){
        console.log("error is"+error);
    }else{
        console.log("server is running on port 5000");
    }
})


