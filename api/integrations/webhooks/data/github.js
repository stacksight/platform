//* says take this value, not from object
module.exports = {
    commit_comment: {
        type: '*comment',
        name: 'comment.body',
        user: 'sender.login',
        url: 'comment.html_url',
        action: 'action'
    },
    create: {
        type: 'ref_type',
        name: 'ref',
        user: 'sender.login',
        url: 'repository.html_url',
        action: '*created'
    },
    delete: {
        type: 'ref_type',
        name: 'ref',
        user: 'sender.login',
        url: 'repository.html_url',
        action: '*deleted'
    },
    deployment: {

    },
    deployment_status: {

    },
    fork: {
        type: '*repository',
        name: 'forkee.full_name',
        user: 'sender.login',
        url: 'forkee.html_url',
        action: '*forked to'
    },
    gollum: {
        type: '*wiki_page',
        user: 'sender.login',
        action: '*updated',
        name: 'repository.name',
        geturl: function(data) {
            return data.repository.html_url + '/wiki';
        }
    },
    issue_comment: {
        type: '*comment',
        name: 'comment.body',
        user: 'sender.login',
        url: 'comment.html_url',
        action: 'action'
    },
    issues: {
        type: '*issue',
        name: 'issue.title',
        user: 'sender.login',
        url: 'issue.html_url',
        action: 'action'
    },
    label: {
        type: '*label',
        name: 'label.name',
        user: 'sender.login',
        url: 'label.url',
        action: 'action'
    },
    member: {
        type: '*member',
        name: 'member.login',
        user: 'sender.login',
        url: 'member.html_url',
        action: 'action'
    },
    membership: {
        type: '*membership',
        name: 'team.name',
        user: 'sender.login',
        url: 'team.members_url',
        action: 'action'
    },
    milestone: {
        type: '*milestone',
        name: 'milestone.title',
        user: 'sender.login',
        url: 'milestone.html_url',
        action: 'action'
    },
    organization: {
        type: '*organization',
        name: 'organization.login',
        user: 'sender.login',
        url: 'organization.url',
        action: 'action'
    },
    page_build: {
        type: '*build',
        name: 'build.url',
        user: 'sender.login',
        url: 'build.url',
        action: '*builded'
    },
    public: {
        type: '*repository',
        name: 'repository.name',
        user: 'sender.login',
        url: 'repository.html_url',
        action: '*published'
    },
    pull_request_review_comment: {
        type: '*pull_request_review_comment',
        name: 'comment.body',
        user: 'sender.login',
        url: 'comment.html_url',
        action: 'action'
    },
    pull_request_review: {
        type: '*pull_request_review',
        name: 'review.body',
        user: 'sender.login',
        url: 'review.html_url',
        action: 'action'
    },
    pull_request: {
        type: '*pull_request',
        name: 'pull_request.id',
        user: 'sender.login',
        url: 'pull_request.html_url',
        action: 'action'
    },
    push: {
        type: '*commit',
        name: 'head_commit.message',
        user: 'sender.login',
        url: 'head_commit.url',
        action: '*pushed'
    },
    repository: {
        type: '*repository',
        name: 'repository.name',
        user: 'sender.login',
        url: 'repository.html_url',
        action: 'action'
    },
    release: {
        type: '*release',
        name: 'release.tag_name',
        user: 'sender.login',
        url: 'release.html_url',
        action: 'action'
    },
    status: {
        type: '*commit_status',
        name: 'commit.commit.message',
        user: 'sender.login',
        url: 'commit.html_url',
        action: '*changed'
    },
    team: {
        type: '*team',
        name: 'team.name',
        user: 'sender.login',
        url: 'team.members_url',
        action: 'action'
    },
    team_add: {
        type: '*team',
        name: 'team.name',
        user: 'sender.login',
        url: 'team.members_url',
        action: '*added repository'
    },
    watch: {
        type: '*repository',
        name: 'repository.name',
        user: 'sender.login',
        url: 'repository.html_url',
        action: 'action'
    }
};