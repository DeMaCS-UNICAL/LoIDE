require.config({
          baseUrl: window.location.protocol + "//" + window.location.host + window.location.pathname.split("/").slice(0, -1).join("/"),
          paths: {
              ace: "ace/lib/ace"
          }
      });
      require(["ace/ace"], function (ace) {
        var editor = ace.edit("editor");
        editor.setTheme("ace/theme/tomorrow");
        editor.getSession().setMode("ace/mode/Asp");
    });