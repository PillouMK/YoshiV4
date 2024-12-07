export class ErrorMessage {
  noWarInChannel() {
    return "Il n'y a pas de war dans ce channel, fait /startwar pour en commencer un";
  }

  mapNotValid(map: string) {
    return `${map} n'est pas une map valide`;
  }

  spotsNotValids(spots: string[]) {
    return `${spots.join(", ")} un des spots n'est pas valide`;
  }

  spotDuplicated(spots: string[]) {
    return `${spots.join(", ")} tu as mis deux fois le même spot`;
  }

  raceDuplicated() {
    return `J'ai reçu deux fois exactement la même course, si c'était volontaire, réessaye`;
  }

  raceIsNotANumber(race: string) {
    return `${race} n'est pas un numéro de course valide`;
  }

  raceIsOutOfRange(race: string) {
    return `${race} : tu ne peux pas éditer une course qui n'a pas encore été enregistrée`;
  }

  spotsLengthOutOfRange(spots: string[]) {
    return `${spots.length.toString()} n'est pas un nombre valide de spot`;
  }

  apiCallError(statusCode: number) {
    if (statusCode > 499) {
      return `Code d'erreur : ${statusCode.toString()}\nErreur : API indisponible`;
    } else {
      return `Code d'erreur : ${statusCode.toString()}\nErreur : Bad request`;
    }
  }
}
