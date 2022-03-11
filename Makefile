
test:
	npm test

serve:
	 nx run-many --parallel --target=serve --projects=booking,booking-front

prod-deploy:
	terraform apply

infra-dev-up:
	docker-compose -f infra/dev/docker-compose.yaml up
