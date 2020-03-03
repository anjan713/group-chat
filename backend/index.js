const express=require('express');
const cors=require('cors');
const monk=require('monk');
const app=express();
const db=monk(process.env.MONGO_URI || 'localhost/meower')
const ratelimit=require('express-rate-limit');

const mews=db.get('mews');
app.use(cors());
app.use(express.json()); //this is body parser so that server can parse json data 

app.get('/',(req,res)=>{
    res.json({
        message:'Meow'
    });
});
app.get('/mews',(req,res)=>{
    mews
    .find()
    .then(mews=>{
        res.json(mews);
    })
})


function isValidMew(mew){
    return mew.name && mew.name.toString().trim() !== '' &&
     mew.content && mew.content.toString().trim() !== '' ;

}

app.use(ratelimit({
    windowMs:30*1000,
    max:100
}));

//we can use joi libary for json validation
app.post('/mews',(req,res)=>{
if(isValidMew(req.body)){
    //insert it into db
    const mew={
        name:req.body.name.toString(),
        content:req.body.content.toString(),
        created:new Date()
};

mews
     .insert(mew)
     .then(createdMew=>{
         res.json(createdMew);
     });


}
else{
    res.status(422);
res.json({
    message:'Hey! Name and Content are required'
});
}
});

app.listen(5000,()=>{
    console.log('listening on 5000');
});
