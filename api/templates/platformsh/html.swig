<html>
<head>
    <meta content="text/html; charset=utf-8" http-equiv="Content-Type">
</head>
<body>
    <div>
        {% if type === 'build' %}
        <div><b>{{app}}/{{stack}} build success ! to get more info go to <a href="{{link}}">here</a>.</b></div>
        <div>{{build}}</div>
        {% else %}
        <div>{{app}}/{{stack}} build failed ! to get more info go to <a href="{{link}}">here</a>.</div>
        {% endif %}
    </div>
</body>
</html>

