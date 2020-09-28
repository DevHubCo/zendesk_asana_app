# Zendesk Asana App

if you don't install `zendesk_apps_tools`, please run:
```
gem install rake
gem install zendesk_apps_tools

# if can't install zendesk_developer_tools, run command:
gem install zendesk_apps_tools -- --with-cflags="-Wno-error=implicit-function-declaration"
```

Then:
```
git clone ...
cd  ...
zat server
```

In your browser, just input `localhost:4567/iframe.html`, you can see the website.

## Know Issues
* [Install zendesk_apps_tools](https://stackoverflow.com/questions/63278694/thin-and-puma-fail-with-similar-issues-error-failed-to-build-gem-native-exten)
