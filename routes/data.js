var express = require('express');
var router = express.Router();
var jwt=require('jsonwebtoken');
var logincheck=require('./../middleware/logincheck');
var certificate=require('./../models/virtualCertificate');
var multer = require('multer');
var papaparse = require('papaparse');

var storage = multer.memoryStorage();
var upload = multer({ storage: storage });

router.post('/add',logincheck(),async function(req,res,next){
    var data=req.body.data;
    var result=new Array();
    if(typeof(data)==='string')
        data=JSON.parse(data);
    

    var promise=data.map(d => {
        return new Promise((resolve,reject)=>{
            certificate.create(
                {
                    usn1:d['usn1'],
                    name1:d['name1'],
                    usn2:d['usn2'],
                    name2:d['name2'],
                    usn3:d['usn3'],
                    name3:d['name3'],
                    usn4:d['usn4'],
                    name4:d['name4'],
                    sem:d['sem'],
                    branch:d['branch'],
                    title:d['title'],
                    category:d['category'],
                    dateOfIssue:d['date of issue']
                },
                function(err,createdData){
                if(err) console.log("Data insertion error --> ",err);
                else{
                    var token=jwt.sign({id:createdData['_id']},process.env.JWT_TOKEN);
                    d['verifyUrl']=process.env.GLOBAL_URL+'/data/verify/'+token;
                    result.push(d);
                    resolve();                    
                }
            });
        });
    });

    Promise.all(promise).then(()=>{        
        res.status(200).json({
            status:'success',
            data:{
                message:'Data insertion successful',
                result:result
            }
        });
    }).catch(console.log('Some error'));

});


router.post('/add-files',upload.single('file'),logincheck(),function(req,res,next){
    var content=req.file.buffer.toString('utf8').trim();

    var json_data = papaparse.parse(content, {header: true}).data;

    var certData=json_data;
    var result=new Array();
    if(typeof(certData)==='string')
        certData=JSON.parse(certData);
    

    var promise=certData.map(d => {
        return new Promise((resolve,reject)=>{
            certificate.create(
                {
                    data: d
                },
                function(err,createdData){
                if(err) console.log("Data insertion error --> ",err);
                else{
                    var token=jwt.sign({id:createdData['_id']},process.env.JWT_TOKEN);
                    d['verifyUrl']=process.env.GLOBAL_URL+'/data/verify/'+token;
                    result.push(d);
                    resolve();                    
                }
            });
        });
    });

    Promise.all(promise).then(()=>{        
        res.status(200).json({
            status:'success',
            data:{
                message:'Data insertion successful',
                result:result
            }
        });
    }).catch(console.log('Some error'));
});


router.get('/verify/:id',function(req,res,next){
    var _id;
    try{
        _id=jwt.verify(req.params.id,process.env.JWT_TOKEN).id;
        if(_id.length===24){
            certificate.findById(_id,function(err,data){
                if(err) console.log('Certificate verification error-->', err);
                else{
                    if(data){
                        console.log(data);
                        res.status(200).render('verified',data);
                    }
                    else
                    res.status(200).render('notverified');
                }
            });
        }
        else{
            res.status(200).render('notverified');
        }
    }
    catch{
        res.status(200).render('notverified');
    }    
});

router.post('/search',logincheck(),function(req,res,next){
    var fname=req.query.fname;
    var lname=req.query.lname;
    var usn=req.query.usn;
    certificate.find({$or:[{fname},{lname},{usn}]},function(err,docs){
        if(err) console.log("Search error-->", err);
        else{
            if(docs){
                res.status(200).json({status:'success',data:{message:'Search complete', value:docs}});
            }
            else{
                res.status(422).json({status:'fail', data:{message:'Name not found'}});
            }
        }
    });
});


module.exports=router;