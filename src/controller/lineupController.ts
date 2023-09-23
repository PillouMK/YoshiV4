import { Embed, EmbedBuilder, ButtonBuilder, Collection, GuildMember, Role, APIEmbedField, ActionRowBuilder, ButtonStyle, User  } from "discord.js";
import lineUpData from "../database/lineup.json";
import { saveJSONToFile } from "../controller/generalController"
import { timeStamp } from "console";
const lineUp : LineUpData = lineUpData as LineUpData;

interface LineUpData {
    lineup: LineUpItem[][]
}

export type LineUpMessage = {
    embed: EmbedBuilder[],
    buttons: ActionRowBuilder<ButtonBuilder>
}

export type LineUpItem = {
        userId: string;
        userName: string;
        isCan: boolean;
        isMute: boolean
};

const lineupPath: string = "./src/database/lineup.json"

export const convertValidsHoursToNumberArray = (hours: string): number[] => {
    const hoursToArray: string[] = hours.split(' ');
    let validsHours:number[] = []
    hoursToArray.forEach(hour => {
        if (/^(0[0-9]|1[0-9]|2[0-3])$/.test(hour)) {
            validsHours.push(Number(hour))
        }
    });
    return validsHours
}



const sortByRoster = async (idRoster: string, lineup: LineUpItem[], listMembers: Collection<string, GuildMember> ): Promise<LineUpItem[]> => {
    let lineUpByRoster: LineUpItem[] = []
    lineup.forEach(element => {
        let member = listMembers.find(member => member.id === element.userId);
        if(member?.roles.cache.find(role => role.id === idRoster)) {
            lineUpByRoster.push(element);
        }
    });
    return lineUpByRoster
}

const makeLineupFields = (lineUpByRoster: LineUpItem[], role: Role):APIEmbedField => {
    let field: APIEmbedField = {name:"", inline: false, value:""};
    let lineupCan: string[] = [];
    let lineupMaybe: string[] = [];
    lineUpByRoster.forEach(elt => {
        elt.isCan ? elt.isMute ? lineupCan.push(`${elt.userName} :mute:`) : lineupCan.push(elt.userName) : elt.isMute ? lineupMaybe.push(`${elt.userName} :mute:`) : lineupMaybe.push(elt.userName)
    })
    field.name = `__YF ${role.name} : (${lineupCan.length}/6)__`;
    
    if(lineupCan.length > 0) {
        field.value = `${lineupCan.join(' / ')}`;
        field.value += lineupMaybe.length > 0 ? ' / ' : ''
    }
    if(lineupMaybe.length > 0) {
        field.value += `(${lineupMaybe.join(') / (')})`
    }
    if(lineupCan.length < 6) field.value += ` +${6-lineupCan.length}`
    return field;
}

export const lineupResponse = async (hours: string, roles: Role[], listMembers: Collection<string, GuildMember>):Promise<LineUpMessage[]> => {
    const hourArray: number[] = convertValidsHoursToNumberArray(hours);
    const isMix: boolean = roles.length === 1 
    let response: LineUpMessage[] = [];
    hourArray.forEach(async hour => {
            const lineUpByHour = lineUp.lineup[hour];
            let embed = makeEmbedLineup(hour.toString(), isMix)
            for (const role of roles) {
                const sortedData = await sortByRoster(role.id, lineUpByHour, listMembers);
                embed.addFields(makeLineupFields(sortedData, role));
            }
            
            const buttonList = makeButtonList(hour, isMix);
            const res:LineUpMessage = {
                embed: [embed],
                buttons: buttonList,
            }
            response.push(res);
    })
    return response
}

function getTimestampForHour(hour: string): string {
    let now = new Date(Date.now());
    now.setHours(parseInt(hour), 0, 0, 0);
    return (now.valueOf()/1000).toString();   
}

const timestampDiscord = (timeStamp: string): string => `<t:${timeStamp}:t>`

const makeEmbedLineup = (hour: string, isMix: boolean):EmbedBuilder => {
    const isMixLabel = !isMix ? 'Line up par roster' : 'Line up mixte'
    const timestamp: string = timestampDiscord(getTimestampForHour(hour));
    const title: string = `${isMixLabel} ${timestamp} :`;

    return new EmbedBuilder()
        .setColor(3066993)
        .setTitle(title)
        .setTimestamp(new Date())
        .setFooter({text : isMixLabel})        
}

const makeButtonList = (hour: number, isMix: boolean): ActionRowBuilder<ButtonBuilder> => {
    const labelView: string = !isMix ? "Voir line up roster" : "Voir line up mixte";
    const idView = !isMix ? "roster" : "mix";
    return new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`can-${hour.toString()}-${idView}`)
                .setLabel(`Can ${hour.toString()}`)
                .setStyle(ButtonStyle.Success)
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`maybe-${hour.toString()}-${idView}`)
                .setLabel(`Maybe ${hour.toString()}`)
                .setStyle(ButtonStyle.Primary)
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`drop-${hour.toString()}-${idView}`)
                .setLabel(`Drop ${hour.toString()}`)
                .setStyle(ButtonStyle.Danger)
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`lineupToggle-${hour.toString()}-${idView}`)
                .setEmoji("<:refresh:1053464938380808252>")
                .setLabel(labelView)
                .setStyle(ButtonStyle.Secondary)
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`mute-${hour.toString()}-${idView}`)
                .setLabel('Mute/Unmute')
                .setStyle(ButtonStyle.Primary)
        );
        
}

export const addMember = (hour: string, member: User, isCan: boolean):string => {
    let lineupByHour = lineUp.lineup[parseInt(hour)];
    const index = lineupByHour.findIndex(elt => elt.userId === member.id)
    if(index === -1) {
        lineupByHour.push({
            userId: member.id,
            userName: member.username,
            isCan: isCan,
            isMute: false
        });
        saveJSONToFile(lineUp, lineupPath);
        return `${member.username} bien ajouté à ${timestampDiscord(getTimestampForHour(hour))}`
    } else {
        if(lineupByHour[index].isCan !== isCan) {
            lineupByHour[index].isCan = isCan
            saveJSONToFile(lineUp, lineupPath);
            return `${member.username} bien passé en ${isCan ? 'can' : 'maybe'} à ${timestampDiscord(getTimestampForHour(hour))}`
        }
        return `${member.username} est déjà en ${isCan ? 'can' : 'maybe'} à ${timestampDiscord(getTimestampForHour(hour))}`
    }
}

export const toggleMute = (hour: string, member: User):string => {
    let lineupByHour = lineUp.lineup[parseInt(hour)];
    const index = lineupByHour.findIndex(elt => elt.userId === member.id)
    if(index !== -1) {
        lineupByHour[index].isMute = !lineupByHour[index].isMute
        saveJSONToFile(lineUp, lineupPath);
        const isMuteString = lineupByHour[index].isMute ? 'mute' : 'unmute'
        return `${member.username} est passée en ${isMuteString} ${timestampDiscord(getTimestampForHour(hour))}`
    } else {
        return `${member.username} n'est pas dans la LU de ${timestampDiscord(getTimestampForHour(hour))}`
    }
}

export const removeMember = (hour: string, member: User): string => {
    let lineupByHour = lineUp.lineup[parseInt(hour)];
    const index = lineupByHour.findIndex(elt => elt.userId === member.id);
    if(index === -1) return `${member.username} n'était pas dans la lu de ${timestampDiscord(getTimestampForHour(hour))}`
    
    lineupByHour.splice(index, 1);
    saveJSONToFile(lineUp, lineupPath);
    return `${member.username} bien été retiré pour ${timestampDiscord(getTimestampForHour(hour))}`
}