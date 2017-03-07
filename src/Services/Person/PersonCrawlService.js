class PersonCrawlService extends BaseService {
    
/**
     * Set social account object and save todatabase
     * @param person
     * @param array social
     * @param socialNetworkId
     * @return PersonSocialAccountInterface|mixed
     */
    setSocialAccount(person, social, socialNetworkId) {
        // find current social network account on person
        socialAccount = this.repository.findWhere([
            'person_id': person.id,
            'social_network_id': socialNetworkId]).first();

        if (!socialAccount) {
            socialAccount = this.repository.newInstance();
        }

        if (isset(social['url'])) {
            socialAccount.setIdentifier(social['url']);
        }
        if (isset(social['username'])) {
            socialAccount.setIdentifier(social['username']);
        }
        if (isset(social['id'])) {
            socialAccount.setIdentifier(social['id']);
        }

        socialAccount.setSocialNetworkId(socialNetworkId);
        socialAccount.setLastCrawledDate(this.getNow());
        socialAccount.setData(json_encode(social));
        if (socialAccount.id) {
            return this.repository.update(socialAccount);
        }
        socialAccount.setPerson(person);
        return this.repository.create(socialAccount);
    }

}
