<?php

namespace Solspace\Freeform\Bundles\Integrations\Providers;

use Solspace\Freeform\Library\DataObjects\Integrations\Integration;
use Solspace\Freeform\Library\DataObjects\Integrations\IntegrationCategory;
use Solspace\Freeform\Library\DataObjects\Integrations\IntegrationSetting;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use Solspace\Freeform\Library\Integrations\SettingBlueprint;
use Solspace\Freeform\Models\IntegrationModel;
use Solspace\Freeform\Records\IntegrationRecord;

class IntegrationDTOProvider
{
    private const TYPE_MAP = [
        IntegrationRecord::TYPE_CRM => 'CRM',
        IntegrationRecord::TYPE_MAILING_LIST => 'Email Marketing',
        IntegrationRecord::TYPE_PAYMENT_GATEWAY => 'Payments',
    ];

    public function convertOne(IntegrationModel $model): ?Integration
    {
        return $this->createDtoFromModel($model);
    }

    /**
     * @param IntegrationModel[] $models
     *
     * @return Integration[]
     */
    public function convert(array $models): array
    {
        return array_map(
            fn ($model) => $this->createDTOFromModel($model),
            $models
        );
    }

    /**
     * @param IntegrationModel[] $models
     *
     * @return IntegrationCategory[]
     */
    public function convertCategorized(array $models): array
    {
        $categories = [];
        foreach ($models as $model) {
            if (!isset($categories[$model->type])) {
                $category = new IntegrationCategory();
                $category->type = $model->type;
                $category->label = self::TYPE_MAP[$model->type];
                $category->children = [];

                $categories[$model->type] = $category;
            }

            $dto = $this->createDtoFromModel($model);

            $category = $categories[$model->type];
            $category->children[] = $dto;
        }

        return array_values($categories);
    }

    private function createDTOFromModel(IntegrationModel $model): Integration
    {
        /** @var IntegrationInterface $class */
        $class = $model->class;

        $icon = $class::getIconPath();
        if ($icon) {
            [$_, $icon] = \Craft::$app->assetManager->publish($icon);
        }

        $dto = new Integration();
        $dto->id = $model->id;
        $dto->name = $model->name;
        $dto->handle = $model->handle;
        $dto->type = $model->type;
        $dto->icon = $icon;
        $dto->settings = [];
        $dto->enabled = $model->enabled;

        /*// TODO - Is this the best place to do this?
        if ($class === 'Solspace\Freeform\Integrations\CRM\HubSpot') {
            $settingsReflection = new \ReflectionClass($class);

            foreach ($settingsReflection->getProperties() as $property) {
                $propertyType = $property->getType();

                // What is this? Causing properties to be skipped
                //if ($propertyType->isBuiltin()) {
                //    continue;
                //}

                try {

                    \Craft::dd($propertyType->getName());

                    $propertyReflection = new \ReflectionClass($propertyType->getName());

                    \Craft::dd([
                        $settingsReflection,
                        $settingsReflection->getProperties(),
                        $propertyReflection
                    ]);
                } catch (\ReflectionException $e) {
                    \Craft::dd($e);

                    continue;
                }



                //if (!$propertyReflection->implementsInterface(IntegrationInterface::class)) {
                //    continue;
                //}

                //$namespaceAttribute = $propertyReflection->getAttributes(SettingNamespace::class)[0];

                //$namespace = $namespaceAttribute->newInstance();
                //$namespace->handle = $property->getName();
                //$namespace->properties = $this->propertyProvider->getEditableProperties($propertyReflection->getName());

                //$namespaces[] = $namespace;
                //$dto->settings = $this->propertyProvider->getEditableProperties($propertyReflection->getName());
            }
        }
        */

        // TODO - instead of using blueprints to grab settings and return in json response, grab using #[Property]

        // @var SettingBlueprint[] $blueprints
        $blueprints = $class::getSettingBlueprints();
        foreach ($blueprints as $blueprint) {
            if (!$blueprint->isInstanceSetting()) {
                continue;
            }

            $handle = $blueprint->getHandle();
            $value = $model->settings[$handle] ?? $blueprint->getDefaultValue();

            $settingDto = new IntegrationSetting();
            $settingDto->type = $blueprint->getType();
            $settingDto->name = $blueprint->getLabel();
            $settingDto->handle = $handle;
            $settingDto->required = $blueprint->isRequired();
            $settingDto->instructions = $blueprint->getInstructions();
            $settingDto->value = $value;

            $dto->settings[] = $settingDto;
        }

        return $dto;
    }
}
