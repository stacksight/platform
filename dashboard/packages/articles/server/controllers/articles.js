'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Article = mongoose.model('Article'),
    _ = require('lodash');

module.exports = function(Articles) {

    return {
        /**
         * Find article by id
         */
        article: function(req, res, next, id) {
            Article.load(id, function(err, article) {
                if (err) return next(err);
                if (!article) return next(new Error('Failed to load article ' + id));
                req.article = article;
                next();
            });
        },
        /**
         * Create an article
         */
        create: function(req, res) {
            var article = new Article(req.body);
            article.user = req.user._id;
            article.save(function(err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot save the article'
                    });
                }

                res.json(article);
            });
        },
        /**
         * Update an article
         */
        update: function(req, res) {
            var article = req.article;

            article = _.extend(article, req.body);


            article.save(function(err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot update the article'
                    });
                }

                res.json(article);
            });
        },
        /**
         * Delete an article
         */
        destroy: function(req, res) {
            var article = req.article;


            article.remove(function(err) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot delete the article'
                    });
                }

                res.json(article);
            });
        },
        /**
         * Show an article
         */
        show: function(req, res) {

            res.json(req.article);
        },
        /**
         * List of Articles
         */
        all: function(req, res) {
            var articlesObj = {};

            if (!req.body.collaborators) res.json({
                articles: articlesObj
            });

            var collaborators = req.body.collaborators.map(function(c) {
                return c.id;
            });

            Article.find({
                user: {
                    $in: collaborators
                },
                type: req.body.type,
                stackId: req.body.stackId
            }).exec(function(err, articles) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot list the articles'
                    });
                }

                for (var i = 0; i < articles.length; i++) {
                    articlesObj[articles[i].id] = articles[i];
                };

                res.json({
                    articles: articlesObj
                });
            });
        }
    };
}
