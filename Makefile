ifndef DEPLOY_PRIME_URL
override DEPLOY_PRIME_URL = localhost
endif

ifndef HUGO_ENV
override HUGO_ENV = development
endif

clean:
	rm -rf public

dependencies:
	npm install && git submodule update -f --init --recursive

serve: dependencies
	hugo server --minify \
		--buildDrafts \
		--buildFuture

production-build: dependencies
	make check-github-rate-limit
	hugo --minify --environment $(HUGO_ENV)
	make check-links

branch-build: dependencies
	make check-github-rate-limit
	hugo \
		--minify \
		--environment $(HUGO_ENV) \
		--baseURL $(DEPLOY_PRIME_URL)
	make check-links

preview-build: dependencies
	make check-github-rate-limit
	hugo \
		--buildDrafts \
		--buildFuture \
		--minify \
		--environment $(HUGO_ENV) \
		--baseURL $(DEPLOY_PRIME_URL)
	make check-links

link-checker-setup:
	curl https://raw.githubusercontent.com/wjdp/htmltest/master/godownloader.sh | bash

run-link-checker:
#	bin/htmltest
	echo "todo: re-enable link checker"

check-links: link-checker-setup run-link-checker

check-links-locally: check-links

check-github-rate-limit: retrieve-github-rate-limit
	$(info [ To translate the reset time (epoch) use 'date -d @<reset value>' ])

retrieve-github-rate-limit:
	$(info [ If build fails at a later stage, verify GitHub rate limit suffices ])
	curl -s https://api.github.com/rate_limit | jq '{ "GitHub rate quota": .resources.core }' || echo "Error: $?"

