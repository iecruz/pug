const express = require('express');
const Joi = require('joi');
const { MongoClient } = require('mongodb');

const router = express.Router();
const url = 'mongodb://localhost';

const mongo = (successCallback, failedCallback) => {
    const mongodb = MongoClient.connect(url, { useNewUrlParser: true });

    mongodb.then(db => {
        let dbo = db.db('pug');
        successCallback(dbo);
        db.close();
    });

    mongodb.catch(error => failedCallback(error));
};

router.get('/', (req, res) => {
    mongo(db => {
        let query = db.collection('tasks').find({done: false}).sort({ sequence: -1 }).toArray();

        query.then(result => res.send(result));
        query.catch(error => res.status(400).send(error.message));
    });
});

router.post('/', (req, res) => {
    let { title, description } = req.body;
    let { error } = validateTask({ title, description });
    if(error) return res.status(400).send(error.details.map((detail) => detail.message).join('\n'));

    let task = {
        title: req.body.title,
        description: req.body.description,
        color: req.body.color,
        done: false
    };

    let promise = new Promise((resolve, reject) => {
        mongo(db => {
            let countQuery = db.collection('tasks').count();
            
            countQuery.then(result => resolve(result));
            countQuery.catch(error => reject(error.message));
        });
    });
    
    promise.then(result => {
        task.sequence = result + 1;
        
        mongo(db => {
            let insertQuery = db.collection('tasks').insertOne(task);

            insertQuery.then(() => res.send(task));
            insertQuery.catch(error => res.status(400).send(error.message));
        });
    });

    promise.catch(error => res.status(400).send(error.message));
});

router.get('/:id', (req, res) => {
    mongo(db => {
        let filter = { sequence: parseInt(req.params.id, 10) };
        let query = db.collection('tasks').findOne(filter);

        query.then(result => res.send(result));
        query.catch(error => res.status(400).send(error.message));
    });
});

router.put('/:id', (req, res) => {
    let { title, description } = req.body;
    let { error } = validateTask({ title, description });
    if(error) return res.status(400).send(error.details.map((detail) => detail.message).join('\n'));

    mongo(db => {
        let filter = { sequence: parseInt(req.params.id, 10) };
        let value = {
            title: req.body.title,
            description: req.body.description,
            color: req.body.color,
            done: req.body.done
        };
        let query = db.collection('tasks').updateOne(filter, { $set: value });

        query.then(result => res.send(result));
        query.catch(error => res.status(400).send(error.message));
    });
});

router.delete('/:id', (req, res) => {
    mongo(db => {
        let filter = { sequence: parseInt(req.params.id, 10) };
        let query = db.collection('tasks').deleteOne(filter);

        query.then(result => res.send(result));
        query.catch(error => res.status(400).send(error.message));
    });
});

const validateTask = (task) => {
    const schema = Joi.object().keys({
        title: Joi.string().min(4).max(16).required(),
        description: Joi.string().max(32).optional().allow(''),
    });

    return Joi.validate(task, schema, { escapeHtml: true });
};

module.exports = router;
