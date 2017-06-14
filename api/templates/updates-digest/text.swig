<html>
<head>
    <meta content="text/html; charset=utf-8" http-equiv="Content-Type">
</head>
<body style="background: #3d434e; text-align: center; margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px;">
 <h1>{{ pagename|title }}</h1>
<ul>
{% for stack in stacks %}
    <li>{{ stack._id.stackName }}</li>
{% endfor %}
</ul>
</body>
</html>
