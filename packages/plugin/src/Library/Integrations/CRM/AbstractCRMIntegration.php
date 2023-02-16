<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2022, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Library\Integrations\CRM;

use Psr\Log\LoggerInterface;
use Solspace\Freeform\Library\Configuration\ConfigurationInterface;
use Solspace\Freeform\Library\Database\CRMHandlerInterface;
use Solspace\Freeform\Library\Integrations\AbstractIntegration;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Translations\TranslatorInterface;
use Symfony\Component\PropertyAccess\Exception\NoSuchPropertyException;
use Symfony\Component\PropertyAccess\PropertyAccessor;

abstract class AbstractCRMIntegration extends AbstractIntegration implements CRMIntegrationInterface, \JsonSerializable
{
    /** @var CRMHandlerInterface */
    private $crmHandler;

    /**
     * @param $id
     * @param $name
     * @param \DateTime $lastUpdate
     * @param $accessToken
     * @param $settings
     * @param $enabled
     * @param LoggerInterface $logger
     * @param ConfigurationInterface $configuration
     * @param TranslatorInterface $translator
     * @param CRMHandlerInterface $crmHandler
     */
    final public function __construct(
        $id,
        $name,
        \DateTime $lastUpdate,
        $accessToken,
        $settings,
        $enabled,
        LoggerInterface $logger,
        ConfigurationInterface $configuration,
        TranslatorInterface $translator,
        CRMHandlerInterface $crmHandler
    ) {
        parent::__construct(
            $id,
            $name,
            $lastUpdate,
            $accessToken,
            $settings,
            $enabled,
            $logger,
            $configuration,
            $translator,
            $crmHandler
        );

        $this->crmHandler = $crmHandler;

        /*
        // TODO - Is this the best place to call this?
        $this->updateProperties($settings);

        // TODO - Is this the best place to call this?
        $access = new PropertyAccessor();

        $reflection = new \ReflectionClass($this);
        foreach ($settings as $propertyKey => $propertySettings) {
            try {
                $property = $reflection->getProperty($propertyKey);
            } catch (\ReflectionException) {
                continue;
            }

            $object = $access->getValue($this, $property->getName());
            foreach ($propertySettings as $key => $value) {
                $access->setValue($object, $key, $value);
            }
        }
        */
    }

    /*
    public function __get(string $name)
    {
        if (isset($this->{$name})) {
            return $this->{$name};
        }
    }

    public function toArray(): array
    {
        $reflection = new \ReflectionClass($this);
        $properties = $reflection->getProperties();

        $array = [];
        foreach ($properties as $property) {
            $array[$property->getName()] = $property->getValue($this);
        }

        return $array;
    }

    public function updateProperties(array $properties = []): void
    {
        $reflection = new \ReflectionClass(static::class);
        foreach ($reflection->getProperties() as $property) {
            try {
                $propertyName = $property->getName();

                if (!isset($properties[$propertyName])) {
                    continue;
                }

                $value = $properties[$propertyName];
                $this->{$propertyName} = $value;
            } catch (NoSuchPropertyException $e) {
                // Pass along
            }
        }
    }
    */

    /**
     * {@inheritDoc}
     */
    public function isOAuthConnection(): bool
    {
        return $this instanceof CRMOAuthConnector;
    }

    /**
     * @return FieldObject[]
     */
    final public function getFields(): array
    {
        if ($this->isForceUpdate()) {
            $fields = $this->fetchFields();
            $this->crmHandler->updateFields($this, $fields);
        } else {
            $fields = $this->crmHandler->getFields($this);
        }

        return $fields;
    }

    /**
     * Fetch the custom fields from the integration.
     *
     * @return FieldObject[]
     */
    abstract public function fetchFields(): array;

    /**
     * Specify data which should be serialized to JSON.
     */
    public function jsonSerialize(): array
    {
        try {
            $fields = $this->getFields();
        } catch (\Exception $e) {
            $this->getLogger()->error($e->getMessage(), ['service' => $this->getServiceProvider()]);

            $fields = [];
        }

        return [
            'id' => $this->getId(),
            'name' => $this->getName(),
            'fields' => $fields,
        ];
    }
}
