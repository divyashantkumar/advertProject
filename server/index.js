import express, { json, urlencoded } from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import cors from 'cors';
import data from './jsonFile/CompanyData.json' assert {type: "json"}

//instantiating express
const app = express();
const PORT = 9192;
const uri = "mongodb+srv://<userid>:<password>@cluster0.rmt4d0c.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {});

//Enable All CORS(Cross-Origin Resource Sharing) Requests
app.use(cors());

// Use to parse incoming requests with JSON payloads and returns on Object
app.use(json());

//Use to parse incoming requests with urlencoded payloads and returns on Object
app.use(urlencoded());

//DB connection establishing
client.connect(err => {
    if (err) console.log(err);
    else console.log(`Connected to DB`);
});

// accessing databse(DBname = company)
const db = client.db('company');
client.close();

//adding company details to "company" collection using JSON file
app.post('/addCompanyDetail', async (req, res) => {
    const companyData = await db.collection('company').insertMany(data);
    res.status(200).send(companyData);
})

//adding company advertisment detail in "ads" collection
app.post('/companyAdDetail', async (req, res) => {
    const companyName = req.body?.name;
    const primaryText = req.body?.primaryText;
    const headline = req.body?.headline;
    const description = req.body?.description;
    const CTA = req.body?.CTA;
    const imageURL = req.body?.imageURL;


    const companyData = await db.collection('company').find({ "name": companyName }).toArray();
    const companyId = companyData[0]._id;

    const ad = {
        "companyId": companyId,
        "primaryText": primaryText,
        "headline": headline,
        "description": description,
        "CTA": CTA,
        "imageURL": imageURL
    }

    const adData = await db.collection('ads').insertOne(ad);
    console.log(adData);

    res.status(200).send(adData);
})

//Getting company details by passing company ID
app.get('/companyDetailById', async (req, res) => {
    const id = req.query.id;

    //pass company id to get company detail and advertisment details corresponding to that company Id
    const company = await db.collection('company').find({ "_id": ObjectId(id) }).toArray()
    const adData = await db.collection('ads').find({ "companyId": ObjectId(id) }).toArray()
    res.status(200).send({
        "data": { "company": company, "adData": adData }
    })

});

// getting company details according to the queryString passed
app.get('/data', async (req, res) => {
    const queryString = req.query?.queryString;
    let data = [];
    let id = [];
    let result = {};
    let adsData = [];
    let company = [];
    let ids = []; 

//getting documents from "company" collection which matches the keywords passed.
    data = await db.collection('company').aggregate([
        { $match: { $text: { $search: queryString }}}
    ]).toArray();

//Pushing company ID (_id) in "id" array.
    data.forEach((item) => {
        id.push(item._id);
    });
    
//getting documents from "ads" collection which matches the keywords passed.
    data = await db.collection('ads').aggregate([
        { $match: { $text: { $search: queryString } } }
    ]).toArray();   

//Pushing company ID (companyId) in "id" array.
    data.forEach((item) => {
        id.push(item.companyId);
    });

//converting array of ObjectId into array of String to make Set.
    id.forEach(element => {
        ids.push(element.toString());
    });

//creating Set of "ids" String Array and converting it to an Array again and assigning it to "ids".
    ids = Array.from(new Set(ids));

//converting Array of String into Array of ObjectId 
    id = [];
    ids.forEach(element => {
        id.push(ObjectId(element));
    });

// finding all the documents from "company" and "ads" cllection which matches the "ids" array elements. 
    company = await db.collection('company').find({ '_id': { $in: [...id] } }).toArray();
    adsData = await db.collection('ads').find({ 'companyId': { $in: [...id] } }).toArray();
    result = {
        "company": company,
        "adsData": adsData
    }
    
    if (result.company.length > 0 || result.adsData.length > 0) {
        res.status(200).send({
            "data": result
        })
    } else {
        res.status(404).send(`
            <h1 style="text-align:center;">Data not available for particular search query!</h1>
            <h3 style="text-align:center;">Please try again</h3>
        `)
    }

    // const result = await db.collection('ads').aggregate([
    //     {
    //         $lookup :
    //         {
    //             from : 'company', 
    //             localField: "companyId", 
    //             foreignField: "_id", 
    //             as: "company"
    //         }
    //     }, 
    //     {   
    //             //1. search that querystring in company[0].name
    //             //2. search that querystring in primaryText
    //             //3. search that querystring in headline
    //             //4. search that querystring in description
    //     }
    // ]);

})


//listining to port
app.listen(PORT, (err) => {
    if (err) console.log(err)
    else console.log(`Server running at http://localhost:${PORT}/`)
})