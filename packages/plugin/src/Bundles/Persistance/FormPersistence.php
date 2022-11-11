<?php

namespace Solspace\Freeform\Bundles\Persistance;

use Solspace\Freeform\Attributes\Field\EditableProperty;
use Solspace\Freeform\controllers\client\api\FormsController;
use Solspace\Freeform\Events\Forms\PersistFormEvent;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Records\FormRecord;
use Solspace\Freeform\Services\FormsService;
use yii\base\Event;

class FormPersistence extends FeatureBundle
{
    public function __construct(
        private FormsService $formsService
    ) {
        Event::on(
            FormsController::class,
            FormsController::EVENT_CREATE_FORM,
            [$this, 'handleFormCreate']
        );

        Event::on(
            FormsController::class,
            FormsController::EVENT_UPDATE_FORM,
            [$this, 'handleFormUpdate']
        );
    }

    public static function getPriority(): int
    {
        return 200;
    }

    public function handleFormCreate(PersistFormEvent $event)
    {
        $payload = $event->getPayload()->form;

        $record = FormRecord::create();
        $record->uid = $payload->uid;
        $record->type = $payload->type;

        $this->update($event, $record);
    }

    public function handleFormUpdate(PersistFormEvent $event)
    {
        $record = FormRecord::findOne(['id' => $event->getFormId()]);

        $this->update($event, $record);
    }

    private function update(PersistFormEvent $event, FormRecord $record)
    {
        $payload = $event->getPayload()->form;

        $record->name = $payload->properties->name;
        $record->handle = $payload->properties->handle;

        $metadata = [];
        $reflection = new \ReflectionClass($payload->type);
        foreach ($reflection->getProperties() as $property) {
            $attribute = $property->getAttributes(EditableProperty::class)[0] ?? null;
            if (!$attribute) {
                continue;
            }

            $metadata[$property->getName()] = $payload->{$property->getName()} ?? $property->getDefaultValue();
        }

        $record->metadata = $metadata;

        $record->validate();
        $record->save();

        if ($record->hasErrors()) {
            $event->addErrorsToResponse('form', $record->getErrors());

            return;
        }

        $form = $this->formsService->getFormById($record->id);
        $event->setForm($form);
        $event->addToResponse('form', $form);
    }
}