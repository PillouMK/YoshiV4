
import { rosterColor, addBlank, botLogs } from "../controller/generalController"
import { getProjectMap} from "./yfApiController";
import { EmbedBuilder, ButtonBuilder, APIEmbedField, ActionRowBuilder, ButtonStyle, AttachmentBuilder, Message, TextChannel, ClientEvents, Client  } from "discord.js";
import settings from "../settings.json"

export interface ProjectMapData {
    projectMapValid: ProjectMap[],
    projectMapNotValid: ProjectMap[]
}

type ProjectMap = {
        idMap: string;
        nameMap: string;
        initialGame: string;
        score: number
        iteration: number
};

type MaxLengthField = {
    idMap: number,
    iteration: number,
    score: number
}

type RankingField = {
    map : APIEmbedField,
    score : APIEmbedField,
    iteration : APIEmbedField,
}


type RankingMessage = {
    embed: EmbedBuilder[],
    buttons: ActionRowBuilder<ButtonBuilder>,
    file: AttachmentBuilder
    content: string,
}

type ProjectMapValues = {
	[key: string]: ProjectMapData | undefined;
}

export let projectMap: ProjectMapValues = {};

export const getProjectMapData = async (idRoster: string, month: number, iteration: number): Promise<ProjectMapData|undefined> => {
    const response = await getProjectMap(idRoster, month, iteration);
    
    if(response.statusCode !== 200) { 
        return undefined
    }
    const data: ProjectMapData = {
        projectMapValid: response.data.projectMapValid,
        projectMapNotValid: response.data.projectMapNotValid
    }
    return data;
}

export const maxLengthFields = (projectMap: ProjectMap[]):MaxLengthField => {
    
    if(projectMap == undefined) {
        return {
            idMap: 0,
            iteration: 0,
            score: 0,
        }
    }
    let maxLength: MaxLengthField = {
        idMap: Math.max(...(projectMap.map(elt => {
            return elt.idMap.toString().length
        }))),
        iteration: Math.max(...(projectMap.map(elt => {
            return elt.iteration.toString().length
        }))),
        score: Math.max(...(projectMap.map(elt => {
            return elt.score.toString().length
        })))
    }
    return maxLength;
}

export const makeProjectMapRankingFields = (projectMap: ProjectMap[]): RankingField[] => {
    let rankingFields: RankingField[] = [];
    let idMapField: string = "";
    let scoreField: string = "";
    let iterationField: string = "";
    let maxLength: MaxLengthField = maxLengthFields(projectMap);
    if(projectMap == undefined) {

    }
        projectMap.forEach((element: ProjectMap, index: number) => {
            let space = (index < 9) ? ` ` : "";
            idMapField += `\`${index + 1}${space} : \` **${element.idMap}** \n`;
            scoreField += `\`${addBlank(element.score.toString(), maxLength.score)} pts\`\n`;
            iterationField += `\`${addBlank(element.iteration.toString(), maxLength.iteration)}\`\n`;
            if(idMapField.length > 1000) {
                rankingFields.push({
                    map: { name: `__Map :__`, value: idMapField, inline: true },
                    score: { name: `__Score :__`, value: scoreField, inline: true },
                    iteration: { name: `__Iteration :__`, value: iterationField, inline: true }
                });
                idMapField = "";
                scoreField = "";
                iterationField = "";
            }
        })
        if(idMapField.length > 0) {
            rankingFields.push({
                map: { name: `__Map :__`, value: idMapField, inline: true },
                score: { name: `__Score :__`, value: scoreField, inline: true },
                iteration: { name: `__Iteration :__`, value: iterationField, inline: true }
            });
        }
        return rankingFields;
}

export const makeProjectMapMobileRankingField = (projectMap: ProjectMap[]):APIEmbedField[] => {
    let maxLength: MaxLengthField = maxLengthFields(projectMap);
    let rankingField: APIEmbedField[] = [];
    let field: string = '';
        projectMap.forEach((element: ProjectMap, index: number) => {
            let space = (index < 9) ? ` ` : "";
            let idMap: string = addBlank(element.idMap, maxLength.idMap);
            let score: string = addBlank(element.score.toString(), maxLength.idMap);
            let iteration: string = addBlank(element.iteration.toString(), maxLength.idMap);
            
            if(field.length > 1000) {
                rankingField.push({
                   name: '__Map :     Score :     Iteration :__', value: field, inline: false
                });
                field = '';
            }
            field += `\`${index + 1}${space} : ${idMap} | ${score} pts | ${iteration}\`\n`;
        })
        if(field.length > 0) {
            rankingField.push({
                name: '__Map :     Score :     Iteration :__', value: field, inline: false
            });
        }
        return rankingField;
}

export const makeEmbedProjectMap = (idRoster: string, projetMapValid: ProjectMap[], projetMapNotValid: ProjectMap[], isMobile: Boolean):EmbedBuilder => {
    let rankingEmbed = new EmbedBuilder()
            .setColor(rosterColor(idRoster))
            .setThumbnail('attachment://LaYoshiFamily.png')
            .setTitle(`----------------- ProjectMap ${idRoster} -----------------`)
            .setTimestamp(Date.now())
            .setFooter({ text: `project Map ${idRoster}` }) 
    if(!isMobile) {
        if(projetMapValid == undefined) {
            rankingEmbed.addFields({ name: `__**Données valides :**__`, value: `Aucune données valides`, inline: false })
        } else {
            const rankingFieldsValid = makeProjectMapRankingFields(projetMapValid);
            rankingEmbed.addFields({ name: `.`, value: `__**Données valides :**__`, inline: false })
            rankingFieldsValid.forEach(element => {
                rankingEmbed.addFields(element.map, element.score, element.iteration);
            })
        }
       
        const rankingFieldsNotValid = makeProjectMapRankingFields(projetMapNotValid);
            rankingEmbed.addFields({ name: `.`, value: `__**Données non-valides :**__`, inline: false })
        rankingFieldsNotValid.forEach(element => {
            rankingEmbed.addFields(element.map, element.score, element.iteration);
        })
    } else {
        if(projetMapValid == undefined) {
            rankingEmbed.addFields({ name: `__**Données valides :**__`, value: `Aucune données valides`, inline: false })
        } else {
            const rankingFieldsValid = makeProjectMapMobileRankingField(projetMapValid);
            rankingEmbed.addFields({ name: `.`, value: `__**Données valides :**__`, inline: false })
            rankingFieldsValid.forEach(element => {
                rankingEmbed.addFields(element);
            })
        }
        
        const rankingFieldsNotValid = makeProjectMapMobileRankingField(projetMapNotValid);
        
            rankingEmbed.addFields({ name: `.`, value: `__**Données non-valides :**__`, inline: false })
        rankingFieldsNotValid.forEach(element => {
            rankingEmbed.addFields(element);
        })
    }
    return rankingEmbed
}

export const rankingMessage = (idRoster: string, month: number, iteration: number, projetMapValid: ProjectMap[], projetMapNotValid: ProjectMap[], isMobile: Boolean):RankingMessage => {
    const content = messageRecap(idRoster, month, iteration);
    const buttons = makeButtonList(idRoster, isMobile);
    const file: AttachmentBuilder = new AttachmentBuilder("./image/LaYoshiFamily.png");
    const embed = makeEmbedProjectMap(idRoster, projetMapValid, projetMapNotValid, isMobile);
    return {
        embed: [embed],
        buttons: buttons,
        content: content,
        file: file
    }
}

const messageRecap = (idRoster: string, month: number, iteration: number) => {
    let saut2ligne = ".\n\n\n";
    let endMsg = "Affichage des données valides et non valides";
    return `${saut2ligne}**ProjectMap ${idRoster} : ** données des ${month} derniers mois, données jugées valides à partir de ${iteration} itérations\n${endMsg}`
}

const makeButtonList = (idRoster: string, isMobile: Boolean): ActionRowBuilder<ButtonBuilder> => {
    
    const labelView: string = isMobile ? "Vue PC" : "Vue Mobile";
    const idView = isMobile ? "pc" : "mobile";
    return new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`projectmap-${idView}-${idRoster}`)
                .setLabel(labelView)
                .setStyle(ButtonStyle.Primary)
        ); 
}

export const updateProjectMapMessage = async (bot: Client, idRoster: string, month: number, iteration: number, projetMapValid: ProjectMap[], projetMapNotValid: ProjectMap[], isMobile: Boolean) => {
    const newMsg = rankingMessage(idRoster, month, iteration, projetMapValid, projetMapNotValid, isMobile);
    const channelId = settings.projectMap.channel;
    const msgId = (settings.projectMap as any)[idRoster];
    try {
        const channel = await bot.channels.fetch(channelId) as TextChannel;
        const message = await channel.messages.fetch(msgId) as Message;

        message.edit({
            content: newMsg.content,
            components: [newMsg.buttons],
            embeds: newMsg.embed,
            files: [newMsg.file]
        })
        const successMessage = `Yoshi successfully updated ProjectMap ${idRoster} message`
        botLogs(bot, successMessage);
    } catch (e) {
        const errorMessage = `Erreur projetMap : ${e}`
        try {
            botLogs(bot, errorMessage);
        } catch (error) {
            console.log(error)
        }
    }
}




