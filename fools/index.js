const fs = require('fs');

function fool(client) {
	const saltGuildId = '361474135509041162';
	const saltGuild = client.guilds.get(saltGuildId);
	// console.log(client.guilds.get(saltGuildId).members);
	const nicks = saltGuild.members.map(x => 
		({ 
			username: x.user.username,
			discriminator: x.user.discriminator, 
			id: x.user.id, 
			nickname: x.nickname === null ? x.user.username : x.nickname
		})
	);


	// fs.writeFileSync('./fools/membersBackup.json', JSON.stringify(nicks, null, 2));

	const backup = require('./membersBackup.json');

	// fran(saltGuild);
	deFran(saltGuild, backup);
}

function fran(guild) {
	guild.members.map(member => {
		member.setNickname('Fran');
	});
}

function deFran(guild, backup) {
	guild.members.map((member, i) => {
		if(typeof member.nickname === 'string' && member.nickname.toLowerCase().includes('fran')) {
			const backupMember = backup.find(x => x.id === member.user.id);
			member.setNickname(backupMember.nickname)
				.then(res => {
					if(i === (guild.members.length - 1)) {
						console.log('DONE DEFRANNING');
					}
				});
		}
	});
}

module.exports.fool = fool;