class Discussions {
  constructor(repo, renderer) {
    this.repo = repo;
    this.renderer = renderer;

    this.discussions = [];
  }

  async maybeHandle() {
    if (!this.renderer.canRender()) {
      return;
    }

    this.renderer.showLoading();
    this.discussions = await this.repo.get(this.networks);
    if (this.discussions) {
      this.renderer.showDiscussions(this.discussions);
    } else {
      this.renderer.showError();
    }
  }
}

class discussionsRepo {
  constructor(discussionsUrl, networks) {
    this.apiKey = 'test';
    this.fetchUrl = `https://discu.eu/api/v0/discussions/url/${encodeURIComponent(discussionsUrl)}`;
    this.networks = networks;
  }

  async get() {
    const allowed_ids = Object.keys(this.networks);
    const response = await fetch(this.fetchUrl, {
      credentials: 'omit',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      }
    });

    if (response.ok) {
      const json = await response.json();
      return json.map((discussion) => allowed_ids.includes(discussion.platform) ? { ...discussion, title: this.networks[discussion.platform] } : null)
        .filter((discussion) => discussion !== null);
    } else {
      return null;
    }
  }
}

class templateRenderer {
  constructor() {
    this.commentTemplate = document.getElementById('comment-line').content;
    this.loadingTemplate = document.getElementById('comment-loading').content;
    this.emptyTemplate = document.getElementById('comment-empty').content;
    this.errorTemplate = document.getElementById('comment-error').content;
    this.commentNode = document.getElementById('comment');
  }

  showLoading() {
    this.commentNode.appendChild(this.loadingTemplate.cloneNode(true));
  }

  showError() {
    this.commentNode.querySelector('.loading').remove();
    this.commentNode.appendChild(this.errorTemplate.cloneNode(true));
  }

  showDiscussions(discussions) {
    this.commentNode.querySelector('.loading').remove();

    if (discussions.length === 0) {
      this.commentNode.appendChild(this.emptyTemplate.cloneNode(true));
    } else {
      discussions.map((discussion) => {
        let commentTemplate = this.commentTemplate.cloneNode(true);
        commentTemplate.querySelector('a').href = discussion.discussion_url;
        let title = discussion.subreddit ? `${discussion.title} r/${discussion.subreddit}` : discussion.title;
        commentTemplate.querySelector('.platform').innerText = title;
        commentTemplate.querySelector('.count').innerText = discussion.comment_count;
        this.commentNode.querySelector('ul').appendChild(commentTemplate);
      });
    }
  }

  canRender() {
    return this.commentNode !== null;
  }
};
