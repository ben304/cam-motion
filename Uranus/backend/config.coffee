path = require('path');
fs = require('fs');
beautify = require('js-beautify').js_beautify;
# beautify(JSON.stringify(pages), { indent_size: 4 })

module.exports = do ->
	config = {}
	config.root_path = path.normalize __dirname + '/..'
	config.records = JSON.parse( fs.readFileSync __dirname + '/records.json', { encoding: 'utf-8' } )
	config.save_records = ->
 		fs.writeFileSync __dirname + '/records.json', beautify(JSON.stringify(config.records), { indent_size: 4 })
	return config