console = {
  log: (str)->
    postMessage str.toString()
}


onmessage = (ev)->
  data = ev.data;
  console.log ev
