README: meanThemeCompass




added in the styleseet:

@import "mean-compass/sass/base";


---------------
Exemple - color
---------------

.exemple { 
  color: $purple;
}

---------------------
Exemple - sprite-icon
---------------------

.exemple { 
   @include icons-smart-sprite(jeton_yellow); 
}

.exemple {
   @include mixin-sprite-icon('jeton_yellow', 35px, 35px,0);
}

-------------------
Exemple - font-icon
-------------------

$comment: '\e608';
$myFamily: 'OpenIdeal';

.calendar { 
   @include mixin-font-icon($comment,$myFamily,16px,red); 
}

--------------
Exemple - Path
--------------

.exemple { 
  background: url($themeImgUrl + 'jeton_yellow.png') no-repeat;
}

$packageName: 'article';

.exemple { 
  background: url($packageImgUrl + 'jeton_yellow.png') no-repeat;
}



