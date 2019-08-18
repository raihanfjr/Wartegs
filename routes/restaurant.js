const fs = require('fs');

module.exports = {
    addRestaurantPage: (req, res) => {
        res.render('add-restaurant.ejs', {
            title: "Welcome to Restaurant | Add a new restaurant"
            ,message: ''
        });
    },
    addRestaurant: (req, res) => {
        if (!req.files) {
            return res.status(400).send("No files were uploaded.");
        }

        let message = '';
        let res_name = req.body.res_name;
        let location = req.body.location;
        let type = req.body.type;
        let waktu_buka = req.body.waktu_buka;
        let short_name = req.body.short_name;
        let uploadedFile = req.files.image;
        let image_name = uploadedFile.name;
        let fileExtension = uploadedFile.mimetype.split('/')[1];
        image_name = short_name + '.' + fileExtension;

        let shortnameQuery = "SELECT * FROM `restaurants` WHERE short_name = '" + short_name + "'";

        db.query(shortnameQuery, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            if (result.length > 0) {
                message = 'Shortname already exists';
                res.render('add-restaurant.ejs', {
                    message,
                    title: "Welcome to Restaurant | Add a new restaurant"
                });
            } else {
                // check the filetype before uploading it
                if (uploadedFile.mimetype === 'image/png' || uploadedFile.mimetype === 'image/jpeg' || uploadedFile.mimetype === 'image/gif') {
                    // upload the file to the /public/assets/img directory
                    uploadedFile.mv(`public/assets/img/${image_name}`, (err ) => {
                        if (err) {
                            return res.status(500).send(err);
                        }
                        // send the player's details to the database
                        let query = "INSERT INTO `restaurants` (res_name, location, type, waktu_buka, image, short_name) VALUES ('" +
                            res_name + "', '" + location + "', '" + type + "', '" + waktu_buka + "', '" + image_name + "', '" + short_name + "')";
                        db.query(query, (err, result) => {
                            if (err) {
                                return res.status(500).send(err);
                            }
                            res.redirect('/');
                        });
                    });
                } else {
                    message = "Invalid File format. Only 'gif', 'jpeg' and 'png' images are allowed.";
                    res.render('add-restaurant.ejs', {
                        message,
                        title: "Welcome to Restaurant | Add a new restaurant"
                    });
                }
            }
        });
    },
    editRestaurantPage: (req, res) => {
        let restaurantId = req.params.id;
        let query = "SELECT * FROM `restaurants` WHERE id = '" + restaurantId + "' ";
        db.query(query, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            res.render('edit-restaurant.ejs', {
                title: "Edit  Restaurant"
                ,restaurant: result[0]
                ,message: ''
            });
        });
    },
    editRestaurant: (req, res) => {
        let restaurantId = req.params.id;
        let res_name = req.body.res_name;
        let location = req.body.location;
        let type = req.body.type;
        let waktu_buka = req.body.waktu_buka;

        let query = "UPDATE `restaurants` SET `res_name` = '" + res_name + "', `location` = '" + location + "', `type` = '" + type + "', `waktu_buka` = '" + waktu_buka + "' WHERE `restaurants`.`id` = '" + restaurantId + "'";
        db.query(query, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            res.redirect('/');
        });
    },
    deleteRestaurant: (req, res) => {
        let restaurantId = req.params.id;
        let getImageQuery = 'SELECT image from `restaurants` WHERE id = "' + restaurantId + '"';
        let deleteUserQuery = 'DELETE FROM restaurants WHERE id = "' + restaurantId + '"';

        db.query(getImageQuery, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }

            let image = result[0].image;

            fs.unlink(`public/assets/img/${image}`, (err) => {
                if (err) {
                    return res.status(500).send(err);
                }
                db.query(deleteUserQuery, (err, result) => {
                    if (err) {
                        return res.status(500).send(err);
                    }
                    res.redirect('/');
                });
            });
        });
    }
};
