# !/bin/bash

# ELASTIC_HOST="localhost:9200"
# ELASTIC_HOST="http://10.189.252.67:9200"
# ELASTIC_HOST="http://104.239.227.210:9200"
# ELASTIC_HOST="http://52.174.47.131:9200"
ELASTIC_HOST="http://search-stacksight-d22jeybp4j64nloggodwyqnfry.eu-west-1.es.amazonaws.com:80"

echo $ELASTIC_HOST


################################################# GLOBAL MAPPING ##########################################################

echo 'events mapping'
curl -XPUT "$ELASTIC_HOST/_template/events_template" -d '
{
    "template" : "events*",
    "mappings": {
        "_default_": {
            "properties": {
                "created": {
                    "type":"date"
                },
                "session": {
                    "type":"string",
                    "index":"not_analyzed"
                },
                "appId": {
                    "type":"string",
                    "index":"not_analyzed"
                },
                "token":{
                    "type":"string",
                    "index":"not_analyzed"
                },
                "geoip" : {
                    "properties" : {
                        "location" : {
                            "type" : "geo_point"
                        }
                    }
                },
                "memory":{
                    "type":"float"
                },
                "loadavg":{
                    "type":"float"
                }
            }
        },
        "event": {
            "dynamic_templates": [{
                "boolean_features": {
                    "path_match": "data.features.*",
                    "mapping": {
                        "type": "boolean"
                    }
                }
            }]
        }
    }
}'

echo 'finish events mapping'

echo 'logs mapping'
curl -XPUT "$ELASTIC_HOST/_template/logs_template" -d '
{
    "template" : "logs*",
    "mappings": {
        "_default_": {
            "properties": {
                "created": {
                    "type":"date"
                },
                "session": {
                    "type":"string",
                    "index":"not_analyzed"
                },
                "appId": {
                    "type":"string",
                    "index":"not_analyzed"
                },
                "token":{
                    "type":"string",
                    "index":"not_analyzed"
                },
                "memory":{
                    "type":"float"
                },
                "loadavg":{
                    "type":"float"
                },
                "content" : {
                    "type": "string",
                    "analyzer": "index_ngram",
                    "search_analyzer": "search_ngram"
                },
               "geoip" : {
                    "properties" : {
                        "location" : {
                            "type" : "geo_point"
                        }
                    }
                }
            }
        }
    },
    "settings": {
        "analysis": {
            "filter": {
                "desc_ngram": {
                    "type": "ngram",
                    "min_gram": 3,
                    "max_gram": 50
                }
            },
            "analyzer": {
                "index_ngram": {
                    "type": "custom",
                    "tokenizer": "keyword",
                    "filter": [ "desc_ngram", "lowercase" ]
                },
                "search_ngram": {
                    "type": "custom",
                    "tokenizer": "keyword",
                    "filter": "lowercase"
                }
            }
        }
    }
}'

echo 'finish logs mapping'

echo 'sessions mapping'
curl -XPUT "$ELASTIC_HOST/_template/sessions_template" -d '
{
    "template" : "sessions*",
    "mappings": {
        "_default_": {
            "properties": {
                "created": {
                    "type":"date"
                },
                "session": {
                    "type":"string",
                    "index":"not_analyzed",
                    "analyzer": "index_ngram",
                    "search_analyzer": "search_ngram"
                },
                "appId": {
                    "type":"string",
                    "index":"not_analyzed"
                },
                "token":{
                    "type":"string",
                    "index":"not_analyzed"
                },
                "geoip" : {
                    "properties" : {
                        "location" : {
                            "type" : "geo_point"
                        }
                    }
                },
                "memory":{
                    "type":"float"
                },
                "loadavg":{
                    "type":"float"
                }
            }
        }
    },  
    "settings": {
        "analysis": {
            "filter": {
                "desc_ngram": {
                    "type": "ngram",
                    "min_gram": 3,
                    "max_gram": 50
                }
            },
            "analyzer": {
                "index_ngram": {
                    "type": "custom",
                    "tokenizer": "keyword",
                    "filter": [ "desc_ngram", "lowercase" ]
                },
                "search_ngram": {
                    "type": "custom",
                    "tokenizer": "keyword",
                    "filter": "lowercase"
                }
            }
        }
    }
}'
echo 'finish sessions mapping'

echo 'updates mapping'
curl -XPUT "$ELASTIC_HOST/_template/updates_template" -d '
{
    "template" : "updates*",
    "mappings": {
        "_default_": {
            "properties": {
                "created": {
                    "type":"date"
                },
                "appId": {
                    "type":"string",
                    "index":"not_analyzed"
                },
                "token":{
                    "type":"string",
                    "index":"not_analyzed"
                },
                "session": {
                    "type":"string",
                    "index":"not_analyzed"
                },
                "geoip" : {
                    "properties" : {
                        "location" : {
                            "type" : "geo_point"
                        }
                    }
                }
            }
        }
    }
}'

echo 'finish updates mapping'

echo 'health mapping'
curl -XPUT "$ELASTIC_HOST/_template/health_template" -d '
{
    "template" : "health*",
    "mappings": {
        "_default_": {
            "dynamic_templates": [{
                "points_to_double": {
                    "path_match": "data.widgets.*point*",
                    "path_unmatch" : "*.pointslist*",
                    "mapping": {
                        "type": "double"
                    }
                }
            }, {
                "id_to_string": {
                    "path_match": "data.widgets.pointslist.*.data.id",
                    "mapping": {
                        "type": "string"
                    }
                }
            }],
            "properties": {
                "created": {
                    "type":"date"
                },
                "session": {
                    "type":"string",
                    "index":"not_analyzed"
                },
                "appId": {
                    "type":"string",
                    "index":"not_analyzed"
                },
                "token":{
                    "type":"string",
                    "index":"not_analyzed"
                },
                "geoip" : {
                    "properties" : {
                        "location" : {
                            "type" : "geo_point"
                        }
                    }
                },
                "memory":{
                    "type":"float"
                },
                "loadavg":{
                    "type":"float"
                },
                "data": {
                    "type": "nested",
                    "properties": {
                        "widgets" : {
                            "type" : "nested",
                             "properties": {
                                "from_date" : {
                                    "type" : "date"
                                },
                                "to_date" : {
                                    "type" : "date"
                                }
                            }
                        },
                        "calc_percent" : {
                            "type" : "double"
                        }
                    }
                }
            }
        },
        "security": {
            "properties": {
                "data": {
                    "type": "nested",
                    "properties": {
                        "widgets": {
                            "type": "nested"
                        }
                    }
                }
            }
        }
    }
}'

echo 'finish health mapping'


# echo 'extensions mappings - generic extensions' 
# curl -XPUT "$ELASTIC_HOST/_template/extensions_template" -d '
# {
#     "template" : "extensions*",
#     "mappings": {
#         "_default_": {
#             "properties": {
#                 "created": {
#                     "type":"date"
#                 }
#             }
#         },
#         "extension": {
#             "properties": {
#                 "nameNversion": {
#                     "type": "string",
#                     "analyzer": "index_ngram",
#                     "search_analyzer": "search_ngram"
#                 }  
#             }
#         }
#     },
#     "settings": {
#         "analysis": {
#             "filter": {
#                 "autocomplete_filter": { 
#                     "type":     "ngram",
#                     "min_gram": 2,
#                     "max_gram": 50
#                 }
#             },
#             "analyzer": {
#                  "index_ngram": {
#                     "type": "custom",
#                     "tokenizer": "keyword",
#                     "filter": [ "autocomplete_filter", "lowercase" ]
#                 },
#                 "search_ngram": {
#                     "type": "custom",
#                     "tokenizer": "keyword",
#                     "filter": "lowercase"
#                 }
#             }
#         }
            
#     }
# }'
# echo 'finish extensions mappings'

echo 'extensions mappings - extensions with appId'
curl -XPUT "$ELASTIC_HOST/_template/extensions_template" -d '
{
    "template" : "extensions*",
    "mappings": {
        "_default_": {
            "properties": {
                "created": {
                    "type":"date"
                },
                "session": {
                    "type":"string",
                    "index":"not_analyzed"
                },
                "appId": {
                    "type":"string",
                    "index":"not_analyzed"
                },
                "token":{
                    "type":"string",
                    "index":"not_analyzed"
                }
            }
        },
        "extension": {
            "properties": {
                "nameNversion": {
                    "type": "string",
                    "analyzer": "index_ngram",
                    "search_analyzer": "search_ngram"
                }  
            }
        }
    },
    "settings": {
        "analysis": {
            "filter": {
                "autocomplete_filter": { 
                    "type":     "ngram",
                    "min_gram": 2,
                    "max_gram": 50
                }
            },
            "analyzer": {
                 "index_ngram": {
                    "type": "custom",
                    "tokenizer": "keyword",
                    "filter": [ "autocomplete_filter", "lowercase" ]
                },
                "search_ngram": {
                    "type": "custom",
                    "tokenizer": "keyword",
                    "filter": "lowercase"
                }
            }
        }
            
    }
}'
echo 'finish extensions mappings'


echo 'inventory mappings'

curl -XPUT "$ELASTIC_HOST/_template/inventory_template" -d '
{
    "template" : "inventory*",
    "mappings": {
        "_default_": {
            "properties": {
                "created": {
                    "type":"date"
                },
                "appId": {
                    "type":"string",
                    "index":"not_analyzed"
                },
                "token":{
                    "type":"string",
                    "index":"not_analyzed"
                },
                "geoip" : {
                    "properties" : {
                        "location" : {
                            "type" : "geo_point"
                        }
                    }
                },
                "session": {
                    "type":"string",
                    "index":"not_analyzed"
                },
                "data" : {
                    "type" : "nested",
                    "properties" : {
                        "name": {
                            "type": "string"
                        },
                        "version": {
                            "type": "string"
                        },
                        "description": {
                            "type": "string"
                        }
                    }
                }
            }
        }
    }
}'
echo 'finish inventory mappings'

echo 'integrations mappings'

curl -XPUT "$ELASTIC_HOST/_template/integrations_template" -d '
{
    "template" : "integrations*",
    "mappings": {
        "_default_": {
            "properties": {
                "created": {
                    "type":"date"
                },
                "appId": {
                    "type":"string",
                    "index":"not_analyzed"
                },
                "token":{
                    "type":"string",
                    "index":"not_analyzed"
                },
                "geoip" : {
                    "properties" : {
                        "location" : {
                            "type" : "geo_point"
                        }
                    }
                },
                "session": {
                    "type":"string",
                    "index":"not_analyzed"
                }
            }
        }
    }
}'
echo 'finish integrations mappings'

echo 'opplogs mapping'
curl -XPUT "$ELASTIC_HOST/_template/opplogs_template" -d '
{
    "template" : "opplogs*",
    "mappings": {
        "_default_": {
            "properties": {
                "created": {
                    "type":"date"
                },
                "appId": {
                    "type":"string",
                    "index":"not_analyzed"
                },
                "token":{
                    "type":"string",
                    "index":"not_analyzed"
                },
                content: {
                    "type":"string"
                }
               
            }
        }
    }
}'

echo 'finish opplogs mapping'


################################################# USER MAPPING ##########################################################
curl -XPUT "$ELASTIC_HOST/_template/user_events_template" -d '
{
    "template" : "user-*-events*",
    "mappings": {
        "_default_": {
            "properties": {
                "created": {
                    "type":"date"
                },
                "session": {
                    "type":"string",
                    "index":"not_analyzed"
                },
                "appId": {
                    "type":"string",
                    "index":"not_analyzed"
                },
                "token":{
                    "type":"string",
                    "index":"not_analyzed"
                },
                "geoip" : {
                    "properties" : {
                        "location" : {
                            "type" : "geo_point"
                        }
                    }
                },
                "memory":{
                    "type":"float"
                },
                "loadavg":{
                    "type":"float"
                }
            }
        },
         "event": {
            "dynamic_templates": [{
                "boolean_features": {
                    "path_match": "data.features.*",
                    "mapping": {
                        "type": "boolean"
                    }
                }
            }]
        }
    }
}'

curl -XPUT "$ELASTIC_HOST/_template/user_logs_template" -d '
{
    "template" : "user-*-logs*",
    "mappings": {
        "_default_": {
            "properties": {
                "created": {
                    "type":"date"
                },
                "session": {
                    "type":"string",
                    "index":"not_analyzed"
                },
                "appId": {
                    "type":"string",
                    "index":"not_analyzed"
                },
                "token":{
                    "type":"string",
                    "index":"not_analyzed"
                },
                "geoip" : {
                    "properties" : {
                        "location" : {
                            "type" : "geo_point"
                        }
                    }
                },
                "memory":{
                    "type":"float"
                },
                "loadavg":{
                    "type":"float"
                },
                "debug": {
                    "type": "string"
                }
            }
        },
        "log" : {
            "properties" : {
                "content" : {
                    "type": "string",
                    "analyzer": "index_ngram",
                    "search_analyzer": "search_ngram"
                },
                "debug": {
                    "type": "string"
                }
            }
        }
    },
    "settings": {
        "analysis": {
            "filter": {
                "desc_ngram": {
                    "type": "ngram",
                    "min_gram": 3,
                    "max_gram": 50
                }
            },
            "analyzer": {
                "index_ngram": {
                    "type": "custom",
                    "tokenizer": "keyword",
                    "filter": [ "desc_ngram", "lowercase" ]
                },
                "search_ngram": {
                    "type": "custom",
                    "tokenizer": "keyword",
                    "filter": "lowercase"
                }
            }
        }
    }
}'

curl -XPUT "$ELASTIC_HOST/_template/user_sessions_template" -d '
{
    "template" : "user-*-sessions*",
    "mappings": {
        "_default_": {
            "properties": {
                "created": {
                    "type":"date"
                },
                "session": {
                    "type":"string",
                    "index":"not_analyzed",
                    "analyzer": "index_ngram",
                    "search_analyzer": "search_ngram"
                },
                "appId": {
                    "type":"string",
                    "index":"not_analyzed"
                },
                "token":{
                    "type":"string",
                    "index":"not_analyzed"
                },
                "geoip" : {
                    "properties" : {
                        "location" : {
                            "type" : "geo_point"
                        }
                    }
                },
                "memory":{
                    "type":"float"
                },
                "loadavg":{
                    "type":"float"
                }
            }
        }
    },
    "settings": {
        "analysis": {
            "filter": {
                "desc_ngram": {
                    "type": "ngram",
                    "min_gram": 3,
                    "max_gram": 50
                }
            },
            "analyzer": {
                "index_ngram": {
                    "type": "custom",
                    "tokenizer": "keyword",
                    "filter": [ "desc_ngram", "lowercase" ]
                },
                "search_ngram": {
                    "type": "custom",
                    "tokenizer": "keyword",
                    "filter": "lowercase"
                }
            }
        }
    }
}'

curl -XPUT "$ELASTIC_HOST/_template/user_inventory_template" -d '
{
    "template" : "user-*-inventory*",
    "mappings": {
        "_default_": {
            "properties": {
                "created": {
                    "type":"date"
                },
                "session": {
                    "type":"string",
                    "index":"not_analyzed"
                },
                "appId": {
                    "type":"string",
                    "index":"not_analyzed"
                },
                "token":{
                    "type":"string",
                    "index":"not_analyzed"
                },
                "geoip" : {
                    "properties" : {
                        "location" : {
                            "type" : "geo_point"
                        }
                    }
                },
                "memory":{
                    "type":"float"
                },
                "loadavg":{
                    "type":"float"
                }
            }
        },
        "inventory": {
            "properties": {
                "data" : {
                    "type" : "nested",
                    "properties" : {
                        "name": {
                            "type": "string"
                        },
                        "version": {
                            "type": "string"
                        },
                        "description": {
                            "type": "string"
                        }
                    }
                }
            }
        }
    }
}'

curl -XPUT "$ELASTIC_HOST/_template/user_health_template" -d '
{
    "template" : "user-*-health*",
    "mappings": {
        "_default_": {
            "dynamic_templates": [{
                "points_to_double": {
                    "path_match": "data.widgets.*point*",
                    "path_unmatch" : "*.pointslist*",
                    "mapping": {
                        "type": "double"
                    }
                }
            }, {
                "id_to_string": {
                    "path_match": "data.widgets.pointslist.*.data.id",
                    "mapping": {
                        "type": "string"
                    }
                }
            }],
            "properties": {
                "created": {
                    "type":"date"
                },
                "session": {
                    "type":"string",
                    "index":"not_analyzed"
                },
                "appId": {
                    "type":"string",
                    "index":"not_analyzed"
                },
                "token":{
                    "type":"string",
                    "index":"not_analyzed"
                },
                "geoip" : {
                    "properties" : {
                        "location" : {
                            "type" : "geo_point"
                        }
                    }
                },
                "memory":{
                    "type":"float"
                },
                "loadavg":{
                    "type":"float"
                },
                "data": {
                    "type": "nested",
                    "properties": {
                        "widgets" : {
                            "type" : "nested",
                             "properties": {
                                "from_date" : {
                                    "type" : "date"
                                },
                                "to_date" : {
                                    "type" : "date"
                                }
                            }
                        },
                        "calc_percent" : {
                            "type" : "double"
                        }
                    }
                }
            }
        },
        "security": {
            "properties": {
                "data": {
                    "type": "nested",
                    "properties": {
                        "widgets": {
                            "type": "nested"
                        }
                    }
                } 
            }
        }
    }
}'

curl -XPUT "$ELASTIC_HOST/_template/user_integrations_template" -d '
{
    "template" : "user-*-integrations-*",
    "mappings": {
        "_default_": {
            "properties": {
                "created": {
                    "type":"date"
                },
                "session": {
                    "type":"string",
                    "index":"not_analyzed"
                },
                "appId": {
                    "type":"string",
                    "index":"not_analyzed"
                },
                "token":{
                    "type":"string",
                    "index":"not_analyzed"
                },
                "geoip" : {
                    "properties" : {
                        "location" : {
                            "type" : "geo_point"
                        }
                    }
                }
            }
        }
    }
}'

curl -XPUT "$ELASTIC_HOST/_template/user_updates_template" -d '
{
    "template" : "user-*-updates*",
    "mappings": {
        "_default_": {
            "properties": {
                "created": {
                    "type":"date"
                },
                "session": {
                    "type":"string",
                    "index":"not_analyzed"
                },
                "appId": {
                    "type":"string",
                    "index":"not_analyzed"
                },
                "token":{
                    "type":"string",
                    "index":"not_analyzed"
                },
                "geoip" : {
                    "properties" : {
                        "location" : {
                            "type" : "geo_point"
                        }
                    }
                },
                "memory":{
                    "type":"float"
                },
                "loadavg":{
                    "type":"float"
                }
            }
        }
    }
}'

curl -XPUT "$ELASTIC_HOST/_template/user_extensions_template" -d '
{
    "template" : "user-*-extensions*",
    "mappings": {
        "_default_": {
            "properties": {
                "created": {
                    "type":"date"
                },
                "session": {
                    "type":"string",
                    "index":"not_analyzed"
                },
                "appId": {
                    "type":"string",
                    "index":"not_analyzed"
                },
                "token":{
                    "type":"string",
                    "index":"not_analyzed"
                }
            }
        },
        "extension": {
            "properties": {
                "nameNversion": {
                    "type": "string",
                    "analyzer": "index_ngram",
                    "search_analyzer": "search_ngram"
                }  
            }
        }
    },
    "settings": {
        "analysis": {
            "filter": {
                "autocomplete_filter": { 
                    "type":     "ngram",
                    "min_gram": 2,
                    "max_gram": 50
                }
            },
            "analyzer": {
                 "index_ngram": {
                    "type": "custom",
                    "tokenizer": "keyword",
                    "filter": [ "autocomplete_filter", "lowercase" ]
                },
                "search_ngram": {
                    "type": "custom",
                    "tokenizer": "keyword",
                    "filter": "lowercase"
                }
            }
        }
            
    }
}'
echo 'finish extensions mappings'

################################################# APP HEALTH  MAPPING ##################################################

curl -XPUT "$ELASTIC_HOST/_template/app_health_template" -d '
{
    "template" : "app-health",
    "mappings": {
        "_default_": {
            "properties": {
                "created": {
                    "type":"date"
                },
                "data": {
                    "type" : "nested",
                    "properties": {
                        "key": {
                            "type": "date"
                        },
                        "types": {
                            "type" : "nested",
                            "properties": {
                                "group_avg": {
                                    "type": "long"
                                },
                                "stacks": {
                                    "type": "nested",
                                    "properties": {
                                        "score": {
                                            "type": "long"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}'

################################################# STACK HEALTH  MAPPING ##################################################

curl -XPUT "$ELASTIC_HOST/_template/stack_health_template" -d '
{
    "template" : "stack-health",
    "mappings": {
        "_default_": {
            "properties": {
                "created": {
                    "type":"date"
                },
                "data": {
                    "type" : "nested",
                    "properties": {
                        "key": {
                            "type": "date"
                        },
                        "types": {
                            "type" : "nested",
                            "properties": {
                                "group_avg": {
                                    "type": "long"
                                },
                                "avg": {
                                    "type": "long"
                                },
                                "stacks": {
                                    "type": "nested",
                                    "properties": {
                                        "score": {
                                            "type": "long"
                                        }
                                    }
                                },
                                "score": {
                                    "type": "nested",
                                    "properties": {
                                        "avg_per_stack": {
                                            "type": "nested",
                                            "properties": {
                                                "value": {
                                                    "type": "long"
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}'


###################################################### USERS MAPPING #####################################################

echo
echo 'putting users mappings'

curl -XPUT "$ELASTIC_HOST/users" -d '
{
    "mappings" : {
        "_default_" : {
            "properties" : {
                "created" : {
                    "type" : "date"
                },
                "lastLogin" : {
                    "type" : "date"
                },
                "lastVisit" : {
                    "type" : "date"
                },
                "email" : {
                    "type" : "string",
                    "index":"not_analyzed"
                }
            }
        }
    }
}'

echo
echo 'putting apps mappings'

curl -XPUT "$ELASTIC_HOST/apps" -d '
{
    "mappings" : {
        "_default_" : {
            "properties" : {
                "created" : {
                    "type" : "date"
                },
                "updated" : {
                    "type" : "date"
                }
            }
        }
    }
}'

echo
echo 'putting stacks mappings'

curl -XPUT "$ELASTIC_HOST/stacks" -d '
{
    "mappings" : {
        "_default_" : {
            "properties" : {
                "created" : {
                    "type" : "date"
                },
                "updated" : {
                    "type" : "date"
                },
                "deployed" : {
                    "type" : "date"
                },
                "data": {
                    "properties": {
                        "usedSpace" : {
                            "type": "string"
                        }
                    }
                }
            }
        },
        "stacks": {
            "dynamic_templates": [{
                "boolean_features": {
                    "path_match": "data.features.*",
                    "mapping": {
                        "type": "boolean"
                    }
                }
            }, {
                 "double_score": {
                    "path_match": "integrations.data.score",
                    "mapping": {
                        "type": "double"
                    }
                }
            }]
        }
    }
}'

