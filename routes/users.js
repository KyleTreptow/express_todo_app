var express = require('express');
var router = express.Router();

/*
 * GET userlist.
 */
router.get('/userlist', function(req, res) {
    var db = req.db;
    var collection = db.get('usercollection');
    var QLimit = 99; // for pagination - to add later
    var QSkip = 0; // for pagination - to add later
    collection.find({},{ limit: QLimit, skip: QSkip },function(e,docs){
        res.json(docs);
    });
});

module.exports = router;

/*
 * POST to adduser.
 */
router.post('/adduser', function(req, res) {
    var db = req.db;
    var collection = db.get('usercollection');
    collection.insert(req.body, function(err, result){
        res.send((err === null) ? { msg: '', new_userid: result._id } : { msg: err });
    });
});

/*
 * DELETE to deleteuser.
 */
router.delete('/deleteuser/:id', function(req, res) {
    var db = req.db;
    var collection = db.get('usercollection');
    var userToDelete = req.params.id;
    collection.remove({ '_id' : userToDelete }, function(err) {
        res.send((err === null) ? { msg: '' } : { msg:'error: ' + err });
    });
});

/*
 * UPDATE to updateuser.
 */
router.post('/updateuser/:id', function(req, res) {
    var db = req.db;
    var collection = db.get('usercollection');
    var userToUpdate = req.params.id;
    collection.update({ '_id' : userToUpdate }, req.body, function(err, result) {
        res.send((err === null) ? { msg: '' } : { msg:'error: ' + err });
    }, { upsert: true });
});