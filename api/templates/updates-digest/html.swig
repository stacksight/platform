<html hola_ext_inject="inited">
<head>
	<title></title>
	<meta content="text/html; charset=utf-8" http-equiv="Content-Type">
</head>
<body style="background: #3d434e; text-align: center; margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; font-size: 14px;">
<table cellpadding="0" cellspacing="0" style="margin: 0 auto;" width="600">
	<tbody>
		<tr>
			<td align="center" style="padding: 30px 0"><span class="sg-image" data-imagelibrary="%7B%22width%22%3A%22195%22%2C%22height%22%3A%2241%22%2C%22alt_text%22%3A%22Stacksight.io%20-%20Now%20You%20Know%21%22%2C%22alignment%22%3A%22%22%2C%22src%22%3A%22http%3A//stacksight.io/wp-content/uploads/2015/04/logo-white-tag-on-red.png%22%2C%22classes%22%3A%7B%22sg-image%22%3A1%7D%2C%22link%22%3A%22%22%7D"><img alt="Stacksight.io - Now You Know!" height="41" src="http://stacksight.io/wp-content/uploads/2015/04/logo-white-tag-on-red.png" style="width: 195px; height: 41px;" width="195" /></span></td>
		</tr>
		<tr>
			<td align="center" style="background-color: #ee534f; padding: 20px 0px 0px 0px;">
			<table cellpadding="0" cellspacing="0" width="100%">
				<tbody>
					<tr>
						<td style="color: #ffffff; text-align: center">
						<h1 style="font-size: 40px; color: #ffffff"><span style="font-size:22px;"><span style="font-family:lucida sans unicode,lucida grande,sans-serif;">Stacksight.io {{ frequency|capitalize }} Status</span></span></h1>
						</td>
					</tr>
				</tbody>
			</table>
			</td>
		</tr>
		<tr>
			<td>
			<table cellpadding="0" cellspacing="0" style="background-color: #ffffff; font-size: 14px; padding: 56px 76px;" width="100%">
				<tbody>
					<tr>
						<td style="color: #000000; text-align: center">
						<p style="color: rgb(34, 34, 34); font-family: arial, sans-serif; font-size: 12.8px; text-align: start; background-color: rgb(255, 255, 255);"><span style="font-size:18px;"><span style="font-family:lucida sans unicode,lucida grande,sans-serif;">Dear {{ user }},&nbsp;</span></span></p>

						<p style="color: rgb(34, 34, 34); font-family: arial, sans-serif; font-size: 12.8px; text-align: start; background-color: rgb(255, 255, 255);"><span style="font-size:18px;"><span style="font-family:lucida sans unicode,lucida grande,sans-serif;">This is your {{ frequency }}&nbsp;updates list for your registered stacks in Stacksight,io.</span></span></p>

						<!-- <p style="color: rgb(34, 34, 34); font-family: arial, sans-serif; font-size: 12.8px; text-align: start; background-color: rgb(255, 255, 255);"><span style="font-size:18px;"><span style="font-family:lucida sans unicode,lucida grande,sans-serif;">The list is organized by Stacks, and includes all of the stacks you have access to.</span></span></p> -->

						<p style="color: rgb(34, 34, 34); font-family: arial, sans-serif; font-size: 12.8px; text-align: start; background-color: rgb(255, 255, 255);">&nbsp;</p>




{% for stack in stacks %}
    <h3 style="text-decoration: underline; text-align: left;"><a href="{{stack.stackDashboardUrl}}"><span style="font-family:lucida sans unicode,lucida grande,sans-serif; color: #222;">{{stack._id.stackName}}</span></a></h3>

   {% for type in stack.types %}
     {% if type.tpl.indexOf('updates') !== -1 %}
      <h4 style="font-family:lucida sans unicode,lucida grande,sans-serif; color: #222; text-align: left;">Available Updates</h4>
      <ul>
         <li style="text-align: left;"><span style="font-family:lucida sans unicode,lucida grande,sans-serif; color:red;">{{type.email.locals.critical}} Critical Updates</span></li>
         <li style="text-align: left;"><span style="font-family:lucida sans unicode,lucida grande,sans-serif;">{{type.email.locals.available}} Non-critical Updates</span></li>
         <li style="text-align: left;"><span style="font-family:lucida sans unicode,lucida grande,sans-serif;"><a href="{{type.email.locals.link}}" style="color: #222;">Full list of available updates</a></span></li>
         <li style="text-align: left;"><span style="font-family:lucida sans unicode,lucida grande,sans-serif;">Last updated:<span style="font-family:courier new,courier,monospace;"> {{type.email.locals.updated|date('M jS Y, H:i')}}</span></span></li>
      </ul>
    {% endif %}

     {% if type.tpl.indexOf('ssl') !== -1 %}
        <h4 style="font-family:lucida sans unicode,lucida grande,sans-serif; color: #222; text-align: left;">HTTPS Status (SSL)</h4>
        <ul>
          <li style="text-align: left;"><span style="font-family:lucida sans unicode,lucida grande,sans-serif;">{{type.email.locals.desc}}</span></li>
        </ul>
    {% endif %}
      
   {% endfor %}
   
   <div style="text-align: left;">
						<hr /></div>

						
			
{% endfor %}

	<p style="color: rgb(34, 34, 34); text-align: start; background-color: rgb(255, 255, 255);">&nbsp;</p>

						<p><span style="font-family:lucida sans unicode,lucida grande,sans-serif;"><span style="font-size:18px;"><span style="color:#000000;">For more details visit your <a href="https://apps.stacksight.io">dashboard</a></span></span></span></p>
            <p><a href="https://apps.stacksight.io/#!/profile/notifications">Manage your notifications</a></p>


                        </td>
					</tr>
				</tbody>
			</table>
			</td>
		</tr>
		<tr>
			<td>
			<table cellpadding="0" cellspacing="0" style="font-size: 14px; padding: 20px 0; color: #ffffff" width="100%">
				<tbody>
					<tr>
						<td style="text-align: left"><span style="color:#FFFFFF;">&copy; 2017 Stacksight.io Ltd.</span></td>
						<td style="text-align: right">&nbsp;</td>
					</tr>
				</tbody>
			</table>
			</td>
		</tr>
	</tbody>
</table>
</body>
</html>

