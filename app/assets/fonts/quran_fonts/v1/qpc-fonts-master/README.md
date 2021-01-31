### خطوط مجمع الملك فهد لطباعة المصحف
### King Fahad Qur'an Printing Complex Fonts

The _mushaf_ fonts can be retrieved from one of the following:
 - `http://qurancomplex.gov.sa/TTF/` + name of the file,
 - or the [Windows installer](http://qurancomplex.gov.sa/Downloads/Fonts/AllPartsFonts.zip).

While the _various_ fonts are located at [http://fonts.qurancomplex.gov.sa](http://fonts.qurancomplex.gov.sa).

#### Usage

##### _Various_ fonts
```css
@font-face {
  font-family: 'Uthman Naskh';
  src: local('KFGQPC Uthman Taha Naskh'),
       url(https://cdn.rawgit.com/mustafa0x/qpc-fonts/f93bf5f3/various-woff2/UthmanTN1%20Ver10.woff2) format('woff2'),
       url(https://cdn.rawgit.com/mustafa0x/qpc-fonts/f93bf5f3/various-woff/UthmanTN1%20Ver10.woff) format('woff');
}
@font-face {
  font-family: 'Uthman Naskh';
  font-weight: bold;
  src: local('KFGQPC Uthman Taha Naskh Bold'), local('KFGQPCUthmanTahaNaskh-Bold'),
       url(https://cdn.rawgit.com/mustafa0x/qpc-fonts/f93bf5f3/various-woff2/UthmanTN1B%20Ver10.woff2) format('woff2'),
       url(https://cdn.rawgit.com/mustafa0x/qpc-fonts/f93bf5f3/various-woff/UthmanTN1B%20Ver10.woff) format('woff');
}
@font-face {
  font-family: 'Uthman Hafs';
  src: local('KFGQPC Uthmanic Script HAFS'),
       url(https://cdn.rawgit.com/mustafa0x/qpc-fonts/f93bf5f3/various-woff2/UthmanicHafs1%20Ver09.woff2) format('woff2'),
       url(https://cdn.rawgit.com/mustafa0x/qpc-fonts/f93bf5f3/various-woff/UthmanicHafs1%20Ver09.woff) format('woff');
}
@font-face {
  font-family: 'QPC Symbols';
  src: local('KFGQPC Arabic Symbols 01'),
       url(https://cdn.rawgit.com/mustafa0x/qpc-fonts/f93bf5f3/various-woff2/Symbols1_Ver02.woff2) format('woff2'),
       url(https://cdn.rawgit.com/mustafa0x/qpc-fonts/f93bf5f3/various-woff/Symbols1_Ver02.woff) format('woff');
}
```

##### Mushaf fonts
```css
@font-face {
  font-family: 'Mushaf Ligatures';
  src: local('QCF_BSML'),
       url(https://cdn.rawgit.com/mustafa0x/qpc-fonts/f93bf5f3/mushaf-woff2/QCF_BSML.woff2) format('woff2'),
       url(https://cdn.rawgit.com/mustafa0x/qpc-fonts/f93bf5f3/mushaf-woff/QCF_BSML.woff) format('woff');
}
@font-face {
  font-family: 'Mushaf Page NNN';
  src: local('QCF_PNNN'),
       url(https://cdn.rawgit.com/mustafa0x/qpc-fonts/f93bf5f3/mushaf-woff2/QCF_PNNN.woff2) format('woff2'),
       url(https://cdn.rawgit.com/mustafa0x/qpc-fonts/f93bf5f3/mushaf-woff/QCF_PNNN.woff) format('woff');
}
```
After replacing `NNN` with the actual page number (001-604). Note that the mushaf fonts use a character to represent each word — see `mushaf.txt`.

[License](http://dm.qurancomplex.gov.sa/copyright-2/)
